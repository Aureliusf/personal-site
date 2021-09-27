---
title: SEO-Twitter
date: 2021-09-02 20:33:52
tags:
---
This project has been in the dark for almost a year, waiting for fact-checked results. SEO-Twitter is a Twitter botnet with the only objective of generating seem-able "organic links" in social media.

## Linkbuilding

Linkbuilding is not something new, people have been doing it for a long time, but it usually involves paying another webmaster for links in recognized websites or posts in other blogs.

> Link-juice coming from social media has a **disproportional weight** in your overall page ranking. 

I guess Google thinks that if social media is talking about you and linking you, it's because it's from real people. And even if they try to patch this, they will have a bad time generating their spam score for each account or trying to get it from Twitter.

## Ways this can go wrong

There are **a lot**  of ways this can fail. If your website gets declared as spam by Twitter, everything you did falls, and you'll get punished with removed links, and your page may go down. 
That is why it is essential to fine-tune your botnet not to get banned.

That is why it is so important to fine tune your botnet not to get banned.

## Implementing

Implementing [Twitter's API](https://developer.twitter.com/en/docs/twitter-api) is fairly easy with one account; if you want to do it with multiple, you'll have to have a database with all the credentials for each account. And don't get me started with generating all the credentials for every account 🤧. 

I used a python wrapper for Twitter's API, simply called [twitter](https://pypi.org/project/twitter/). With this, you only need to give it the correct credentials and my content to publish tweets.

Just like this:
~~~python
t = Twitter(auth=OAuth(token, token_secret , common_token, common_secret))
t.statuses.update(status=tweet)
~~~

Now you'll need a connection with your credentials database. I stored token, and token_secret that are unique to each account with the account name as key and an epoch time of the last time they tweeted for not getting banned purposes.

With all that set, now the script will look something like this:
~~~python
while True:
    for n in account_n:
        credentials = get_credentials(n);

        if (credentials['last_time']-time.time()< not_get_banned_time):

            t = Twitter(auth=OAuth(credentials['token'], credentials['token_secret'] , common_token, common_secret))
            t.statuses.update(status=tweet)

~~~
You'll want to add exceptions to your code, so it still runs even if Twitter is down or something goes wrong.
~~~python
while True:
    for n in account_n:
        credentials = get_credentials(n);

        if (credentials['last_time']-time.time()< not_get_banned_time):
            try:
                t = Twitter(auth=OAuth(credentials['token'], credentials['token_secret'] , common_token, common_secret))
                t.statuses.update(status=tweet)
            except:
                print('something went wrong')
                print(credentials['account_name'],"has problems")
        else:
            time.sleep(some_sensible_time)

~~~

Now let's talk about that `not_get_banned_time`. Twitter would not tell anyone exact numbers on how much you can publish without getting banned for spam. They probably don’t have a hardcode number. News accounts are posting every minute and don’t get banned. For the rest of us mortals without special contracts, the word in the street is that you can publish every two hours wihtout getting worried.

You’ll need to send a tweet on each account every two hours or 7200 seconds for maximum efficiency. Twitter’s API is rate-limited at 1000 tweets an hour. If you do the math, that means you can support a theoretical 2000 accounts in only one developer account. I think you’ll hit other limits first, though.

For getting that `not_get_banned_time` you need to divide 7200 by the number of accounts. So for 3 accounts, your script will publish every 2400s, and each account will publish every 7200s. This math is theoretical; add 2.3s or so for every publishing, but that only gets us in a safer spot.

~~~python
    not_get_banned_time = 7200/account_n
~~~

## Cover your back

Doing this strategy carries its problems; you’ll need to have some things in mind for mitigating possible issues.
+ Cover your website with URL shorteners.
        They let link juice pass but will cover you from spam filters.
+ Do not use duplicate URLs every time.
        To avoid spam filters, you can use multiple face URLs that go to the same URL.

## Results

I used this strategy in the best site possible, a large eCommerce moneysite. 
>The store started with 60k products and 15k pages listed and now a year later the same store has 90k products and 70k pages listed.

Almost 50k tweets were created and published over an entire year. Tweets content consisted of big keywords relevant to each unique product and a link to the product page.

*Disclaimer: All the accounts used and will be used are **not compromised accounts** or in any shape or form, not mine. Please don’t do anything illegal; thanks <3.
