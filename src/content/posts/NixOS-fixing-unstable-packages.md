---
title: "Fixing Unstable Packages in Nix"
date: 2026-02-13 12:00:00
tags: ["Infrastructure as Code", "nix", "flakes", "nixOS"]
featured: true
highlight: "Infrastructure as Code · Reproducibility · Fixed Dependency Mismatches"
---

When nixpkgs lags behind upstream releases, you can import packages directly from source using Nix Flakes. This post covers how to handle the dependency mismatches that arise.

**TL;DR:** Import the upstream flake and pin to a specific release. If dependencies mismatch, either pin to a compatible release or overlay the dependency. Always pin to specific refs for reproducibility.

---

## The Problem

Nix packages (nixpkgs) is a curated repository. This curation creates a delay between upstream releases and package availability.

For tools like [opencode](https://opencode.ai) this lag is problematic. New features arrive daily, but nixpkgs can take weeks to update.

**Real example:** I hit a `ContextOverflowError` with opencode. The fix was in v1.1.54, but nixpkgs unstable only had v1.1.53. I imported the flake directly, but building revealed a dependency mismatch: opencode required bun 1.3.9 while nixpkgs had bun 1.3.8.

---

## Solution 1: Importing Flakes Directly

**Nix Flakes** enable importing packages directly from other Git repositories that expose a `flake.nix`. This bypasses nixpkgs entirely.

### The Setup

In your `flake.nix`, add the upstream repository as an input:

```nix
{
  inputs = {
    nixpkgs.url = "github:nixOS/nixpkgs/nixpkgs-unstable";
    
    # Import opencode directly from GitHub
    opencode.url = "github:anomalyco/opencode";
  };

  outputs = inputs@{ nixpkgs, opencode, ... }: {
    # ... your configuration
  };
}
```

Then reference the package in your system configuration:

```nix
# In darwin.nix or configuration.nix
{ config, pkgs, inputs, ... }:

{
  environment.systemPackages = [
    # Reference the flake package directly
    inputs.opencode.packages.${pkgs.system}.opencode
    
    # Other packages from nixpkgs
    pkgs.neovim
    pkgs.git
  ];
}
```

**Key insight:** The `${pkgs.system}` interpolation ensures you get the correct architecture binary (darwin-arm64, x86_64-linux, etc.). This matters because Nix builds separate packages for each platform, and using the wrong architecture will result in binary incompatibility or build failures. The variable evaluates to your current system (e.g., `aarch64-darwin` for Apple Silicon Macs, `x86_64-linux` for 64-bit Linux).

### How It Works

When you import the opencode flake, Nix evaluates it and builds the package using dependencies from your nixpkgs. The build process and dependencies are defined upstream, but the actual build tools come from your nixpkgs.

### What About Packages Without Flakes?

Not all upstream projects provide `flake.nix` files. For these, you have two options:
1. **Wait for nixpkgs** - Most popular packages eventually get packaged
2. **Write your own flake** - Use nixpkgs builders like `buildNpmPackage`, `buildGoModule`, or `mkDerivation` to package it yourself in your config

Writing a flake wrapper requires more Nix knowledge but gives you the same control as importing native flakes.

---

## The Challenge: Dependency Version Mismatch

**Problem:** The first build failed with:

```
error: This script requires bun@^1.3.9, but you are using bun@1.3.8
```

The opencode dev branch had updated its build-time dependency on bun, but nixpkgs unstable only had bun 1.3.8 at the moment.

### Debugging Dependency Versions

*Note: These versions reflect the state during this incident. Package versions in nixpkgs change over time as the repository updates.*

When you encounter version mismatches, check what your nixpkgs provides:

```bash
# Check current bun version in your nixpkgs
nix eval nixpkgs#bun.version

# Check available versions in nixpkgs history
nix search nixpkgs bun --json | jq '.[].version'
```

This helps determine if you need to overlay the dependency or pin to a different release.

Build-time dependencies must match exactly. When upstream upgrades a build dependency before nixpkgs catches up, source builds fail.

---

## Solution 2: Pin to a Stable Release

The simplest fix: pin to a specific Git tag that works with your nixpkgs:

```nix
{
  inputs = {
    # Pin to v1.1.57 instead of floating dev branch
    opencode.url = "github:anomalyco/opencode?ref=v1.1.57";
  };
}
```

### Why This Works

- v1.1.57 was built and tested against bun 1.3.8
- The version constraint is satisfied
- Build proceeds normally
- You still get newer features than nixpkgs provides

### Trade-offs

| Aspect | Floating Branch | Pinned Release |
|--------|----------------|----------------|
| Freshness | Latest daily | Fixed version |
| Stability | May break | Tested, stable |
| Maintenance | Auto-updates | Manual updates |
| Dependencies | Must track upstream | Known working |

For production systems, pinning is the pragmatic choice.

### Rollback Strategy

If a pinned version breaks:

**Revert flake.lock:**
```bash
git checkout HEAD~1 -- flake.lock
```

**Or pin to a different version:**
```nix
{
  inputs = {
    # Try an older or newer release
    opencode.url = "github:anomalyco/opencode?ref=v1.1.59";
    # Or pin to a specific commit
    # opencode.url = "github:anomalyco/opencode?rev=abc123...";
  };
}
```

Then update and rebuild:
```bash
nix flake update
sudo darwin-rebuild switch --flake ~/dotfiles  # or nixOS-rebuild
```

---

## Solution 3: Overlay the Build Dependency 

On another nixOS system, I solved this differently: keep opencode on latest/dev but upgrade bun through an overlay.

### The Overlay Approach

**Darwin (Apple Silicon):**
```nix
{
  nixpkgs.overlays = [
    (final: prev: {
      bun = prev.bun.overrideAttrs (oldAttrs: rec {
        version = "1.3.9";
        src = prev.fetchurl {
          url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-darwin-aarch64.zip";
          sha256 = "sha256-AAA...";
        };
      });
    })
  ];
}
```

**nixOS (x86_64):**
```nix
{
  nixpkgs.overlays = [
    (final: prev: {
      bun = prev.bun.overrideAttrs (oldAttrs: rec {
        version = "1.3.9";
        src = prev.fetchurl {
          url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-linux-x64.zip";
          sha256 = "sha256-AAA...";
        };
      });
    })
  ];
}
```

Get the correct hash with:
```bash
nix-prefetch-url https://github.com/oven-sh/bun/releases/download/bun-{version}/bun-darwin-aarch64.zip
```

Then keep opencode on the dev branch:

```nix
{
  inputs = {
    opencode.url = "github:anomalyco/opencode";  # Latest dev
  };
}
```

### When to Use Overlays

**Use when:** You need the absolute latest features and have time to debug build issues.

**Avoid when:** The dependency has complex chains, you're managing multiple machines, or stability matters more than freshness.

---

## Comparison: Three Approaches

| Solution | Complexity | opencode Version | Bun Version | Best For |
|----------|-----------|------------------|-------------|----------|
| **A. Pin release** | Low | Fixed (v1.1.57) | From nixpkgs | Production stability |
| **B. Overlay bun** | Medium | Latest dev | Overridden 1.3.9+ | Bleeding-edge features |
| **C. Wait for nixpkgs** | None | Outdated | From nixpkgs | Zero maintenance |

---

## Key Points

1. **Flakes enable source-first dependencies** - You can depend directly on Git repositories, specific commits, tags, or branches.

2. **Build-time requirements must match** - Unlike runtime dependencies, build tools must match exactly what upstream expects.

3. **Pin to specific refs in production** - Floating branches change over time. A working config today may break tomorrow.

4. **Overlays are powerful but complex** - Prefer direct references for single packages. Use overlays only when necessary.

---

## My Configuration

**Darwin (macOS):**

`flake.nix:`
```nix
{
  inputs = {
    nixpkgs.url = "github:nixOS/nixpkgs/nixpkgs-unstable";
    darwin.url = "github:lnl7/nix-darwin/master";
    opencode.url = "github:anomalyco/opencode?ref=v1.1.57";
  };

  outputs = inputs@{ nixpkgs, darwin, opencode, ... }: {
    darwinConfigurations.macbook = darwin.lib.darwinSystem {
      system = "aarch64-darwin";
      specialArgs = { inherit inputs; };
      modules = [ ./darwin.nix ];
    };
  };
}
```

`darwin.nix:`
```nix
{ config, pkgs, inputs, ... }:
{
  environment.systemPackages = [
    inputs.opencode.packages.${pkgs.system}.opencode
    pkgs.neovim
    pkgs.git
  ];
}
```

**nixOS:**

`flake.nix:`
```nix
{
  inputs = {
    nixpkgs.url = "github:nixOS/nixpkgs/nixpkgs-unstable";
    opencode.url = "github:anomalyco/opencode?ref=v1.1.57";
  };

  outputs = inputs@{ nixpkgs, opencode, ... }: {
    nixOSConfigurations.desktop = nixpkgs.lib.nixOSSystem {
      system = "x86_64-linux";
      specialArgs = { inherit inputs; };
      modules = [ ./configuration.nix ];
    };
  };
}
```

`configuration.nix:`
```nix
{ config, pkgs, inputs, ... }:
{
  environment.systemPackages = [
    inputs.opencode.packages.${pkgs.system}.opencode
    pkgs.neovim
    pkgs.git
  ];
}
```

### Rebuilding After Changes

```bash
# Update flake.lock
nix flake update
```

**macOS (nix-darwin):**
```bash
sudo darwin-rebuild switch --flake ~/dotfiles
```

**nixOS:**
```bash
sudo nixOS-rebuild switch --flake ~/dotfiles
```

---

## Summary

When nixpkgs lags behind upstream:

1. Import the flake directly
2. Pin to a working release
3. Handle dependency mismatches by pinning back or overlaying

Match the approach to your need for new features versus maintenance overhead.

## Quick Reference

```nix
# Pin to specific version (recommended)
opencode.url = "github:anomalyco/opencode?ref=v1.1.57";

# Pin to specific commit (most stable)
opencode.url = "github:anomalyco/opencode?rev=abc123...";

# Floating dev branch (use with caution)
opencode.url = "github:anomalyco/opencode";

# Reference in config
inputs.opencode.packages.${pkgs.system}.opencode
```
