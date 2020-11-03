exports.textTnC = () => {
    return `
Source code / bot is an open-source program (free) written using Javascript, you can use, copy, modify, combine, publish, distribute, sub-license, and or sell copies without removing the main author of the source code / bot.
By using this source code / bot, you agree to the following Terms and Conditions:
- Source code / bot does not store your data on our servers.
- The source code / bot is not responsible for the stickers you make from this bot and the videos, images and other data that you get from the source code / bot.
- Source code / bot may not be used for services that aim / contribute to:
    • sex / human trafficking
    • gambling
    • harmful addictive behavior
    • crime
    • violence (unless necessary to protect public safety)
    • burning forest/ deforestation
    • hate speech or discrimination based on age, sex, gender identity, race, sexuality, religion, nationality

Source Code BOT: https://github.com/YogaSakti/imageToSticker
NodeJS WhatsApp library: https://github.com/open-wa/wa-automate-nodejs

Best regards, Yoga Sakti.`
}

exports.textMenu = (pushname) => {
    return `
Hi, ${pushname || ''}! 👋️
Here are some of the features of this bot! ✨

Sticker Maker:
1. *#sticker*
To convert an image into a sticker, send the image with the caption #sticker or reply to the image that has been sent with #sticker.

2. *#stickers* _<Image Url>_
To change the image from the url to a sticker.

3. *#gifsticker* _<Giphy URL>_ / *#stickergif* _<Giphy URL>_
To turn a gif into a sticker (Giphy only)

Downloader:
1. *#tiktok* _<post / video url>_
Will return video tiktok.

2. *#fb* _<post / video url>_
Will return the Facebook video download link.

3. *#ig* _<post / video url>_
Will return the Instagram video download link.

4. *#twt* _<post / video url>_
Will return the Twitter video download link.

Other:
1. *#meme* _ <top text> _ | _ <bottom text> _
To create a meme with top and bottom text
Usage: send image with caption _ * # meme top me | you under * _, or you can also reply to an existing image.

2. *#translate* _ <language code> _
To interpret messages into the specified language.
Usage: Reply / quote / reply the message you want to translate with _ *# translate id* _ <- id is the language code. language code can be seen at *https: //bit.ly/33FVldE*
Here are the codes for some popularly used languages:
English : en
Dutch: nl
French: fr
Malayalam: ml
German: de
Hindi: hi
Indonesian: id
Italian: it
Spanish: es
Tamil: ta
Telugu: te

Features added by Unni:
1.1 *#theri* @user
Bot will insult the mentioned user in Malayalam

1.2 *#addtheri* _<malayalam insult>_
Adds Malayalam insults into a database which is used by the "#theri" feature

1.3 *#therilist*
Prints all the insults from the database

1.4 *#thericount*
Shows the number of insults in the database

2.1 *#gaali* @user
Bot will insult the mentioned user in some Indian language

2.2 *#addgaali* _<desi insult>_
Adds desi insults into a database which is used by the "#gaali" feature

2.3 *#gaalilist*
Prints all the insults from the database

2.4 *#gaaliicount*
Try it

2.5 *#countbatabsdk*
Shows the number of gaalis in the database

3. *#emojipasta* <text as a single paragraph (the input will break at new line)>
What do you think it's do? Call the FBI?

4. *#score* <team name> or <league name>
Displays the last scores from last 6 matches of the team if there is no match today. 
If there is a match today that is going on or ended recently, only that score will be displayed. 
Currently supports most majors sports and leagues involving two teams and two numerical scores that show up if you Google search "<team name> score"
(Live score for cricket matches not working, will be fixed soon enough)


Etc:
1. *#tnc*
Displays Bot Terms and Conditions.

Hope you have a great day!✨`
}

exports.textAdmin = () => {
    return `
⚠ [ *Admin Group Only* ] ⚠ 
Here are some of the group admin features included in this bot!

1. *#kick* @user
Removing members from the group (can be more than 1).

2. *#promote* @user
Promote members to group admins.

3. *#demote* @user
Demote Group admins.

3. *#tagall*
Mention of all group members.`
}
