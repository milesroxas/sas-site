I've been working on my agency's website the past month and today I want to share how I accidentally built a shader studio in my CMS.

Some context...

While our new site is live, we're still in the process of honing in and developing a super awesome art direction.

![[Screenshot 2026-09-18 at 5.15.06 PM.png]]

We're also in the process of writing new content but we do need to have a site that contains all those juicy keywords that google was thirsty for and now AI seems to be as well even though they apparently consume....x gallons per token?!

![[Screenshot 2026-09-18 at 5.16.05 PM.png]]

Anyways - with all that in mind no matter where we end up with our new art direction I know we'll need shaders. And rather than just have a wall of text for our internal content rich pages I need to bring some life into them.

![[Screenshot 2026-09-18 at 5.17.00 PM.png]]

So my plan was to create an abstract visual shader that we can display across internal pages.

I probably could have just used stock images and moved on with my life but here we are.

First I need to figure out my shader.

I wanted something that feels like data but can be tweaked to show something more organic.


![[Screenshot 2026-09-18 at 5.21.16 PM.png|517]]

![[Pasted image 20260918171423.png|517]]

Luckily I have this totally not over engineered Immersive Lab part of the site where I've been prototyping ideas and interactions late at night when I should instead be sleeping.

![[Screenshot 2026-09-18 at 5.07.16 PM.png]]

It's got leva wired up already.

After a couple iterations I landed on this streak field shader.



![[Screenshot 2026-09-18 at 5.30.49 PM.png|357]]![[Screenshot 2026-09-18 at 5.30.44 PM.png|322]]

![[Screenshot 2026-09-18 at 5.33.49 PM.png|358]]![[Screenshot 2026-09-18 at 5.34.06 PM.png|323]]

The layout lets me control the composition and shape of the entire shader



To bring it to life, I have motion and flow controls that animate and render points in different ways.
![[Screenshot 2026-09-18 at 5.25.30 PM.png|271]]

I started off with a few noise functions to get a wider range of looks and behavior out of my particles.

![[Screenshot 2026-09-18 at 5.27.11 PM.png|451]]![[Screenshot 2026-09-18 at 5.27.29 PM.png|220]]

![[Screenshot 2026-09-18 at 5.29.10 PM.png|451]]![[Screenshot 2026-09-18 at 5.29.15 PM.png|224]]


Great now that's built out I started thinking about how I would get this placed alongside my content.



I first built out a preset system so I can easily grab these values from leva and paste them into my code that will then render on payload as an option site editors can select.

I definitely could have stopped here and believe it or not I did.

Until days later it started bugging me and I knew there was a better way.

So, I went back in and got to work.

The goal is for anyone logged into my cms to be able to create a shader and then use it on any block that displays media.

We also need a way to generate a poster or placeholder image to serve to users if the shader takes some time to load.

Those are the requirements but of course a few more got added because we're just features we met along the way...

To do this in the browser, I thought about a completely separate app. Kind of like how you would use something like Spline or rive and then just render that.

I mean, theres actually a bunch of services that exist already that have a ton more features. But there's no fun in that. I also didn't want to spend time spinning up infra for just this shader especially if it's going to be a big part of our site.

I decided to stay within Payload. And that's the beauty of payload. It's super easy to extend and build whatever you want.

I had claude spin up a plugin that includes the configs I have in my immersive lab. Then I moved into building a version control and release system. This part is still kinda clunky but it works!

Finally all I had to do was query this into all the media fields where I already have my coded presets wired up.

And here's the final work flow.

We go into payload. Go to Streak field. Create a new one - tweak some values. Check light and dark modes. Pointer behavior. And then publish the release.

Now I can go into any collection select an entry and then in my media field select the shader I just made.

There we have it. My CMS now has a shader studio.





