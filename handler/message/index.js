require('dotenv').config()
const { decryptMedia, Client } = require('@open-wa/wa-automate')
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Kolkata').locale('id')
const { downloader, cekResi, removebg, urlShortener, meme, translate, getLocationData } = require('../../lib')
const { msgFilter, color, processTime, isUrl } = require('../../utils')
const mentionList = require('../../utils/mention')
const { uploadImages } = require('../../utils/fetcher')

const { menuId, menuEn } = require('./text') // Indonesian & English menu



module.exports = msgHandler = async (client = new Client(), message) => {
    try {
        //I have no idea what I'm doing starts here
        // let theris = require('./text/theri.js')
        // let fs = require("fs")
        // let text = fs.readFileSync("D:\\maymay\\whatsapp-utility-bot\\imageToSticker\\handler\\message\\text\\therilist.txt")
        // let textByLine = text.toString().split("\n")
        
        //Football score stuff
        // const {PythonShell} =require('python-shell'); 
        const {spawn} = require('child_process')
        const path = require('path')
        const { execSync } = require('child_process')

        //I have no idea what I'm doing ends here

        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName // verifiedName is the name of someone who uses a business account
        const botNumber = await client.getHostNumber() + '@c.us'
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const groupMembers = isGroupMsg ? await client.getGroupMembersId(groupId) : ''
        const isGroupAdmins = groupAdmins.includes(sender.id) || false
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false

        // Bot Prefix
        const prefix = '#'
        body = (type === 'chat' && body.startsWith(prefix)) ? body : ((type === 'image' && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const arg = body.trim().substring(body.indexOf(' ') + 1)
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const uaOverride = process.env.UserAgent
        const url = args.length !== 0 ? args[0] : ''
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'

        // [BETA] Avoid Spam Message
        if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        //
        if (!isCmd && !isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname)) }
        if (!isCmd && isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname), 'in', color(name || formattedTitle)) }
        if (isCmd && !isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }

        // [BETA] Avoid Spam Message
        msgFilter.addFilter(from)

        switch (command) {
        // Menu and TnC
        case 'speed':
        case 'ping':
            await client.sendText(from, `Pong!!!!\nSpeed: ${processTime(t, moment())} _Second_`)
            break
        case 'tnc':
            await client.sendText(from, menuEn.textTnC())
            break
        case 'menu':
        case 'help':
            await client.sendText(from, menuEn.textMenu(pushname))
                .then(() => ((isGroupMsg) && (isGroupAdmins)) ? client.sendText(from, 'Menu Admin Grup: *#menuadmin*') : null)
            break
        case 'menuadmin':
            if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup! [Group Only]', id)
            if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup! [Admin Group Only]', id)
            await client.sendText(from, menuEn.textAdmin())
            break
        case 'donate':
        case 'donasi':
            await client.sendText(from, menuEn.textDonasi())
            break
        // Sticker Creator
        case 'sticker':
        case 'stiker': {
            if ((isMedia || isQuotedImage) && args.length === 0) {
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                client.sendImageAsSticker(from, imageBase64).then(() => {
                    client.reply(from, 'Here\'s your sticker')
                    console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                })
            } else if (args[0] === 'nobg') {
                /**
                * This is Premium feature.
                * Check premium feature at https://trakteer.id/red-emperor/showcase or chat Author for Information.
                */
                client.reply(from, 'ehhh, what\'s that???', id)
            } else if (args.length === 1) {
                if (!isUrl(url)) { await client.reply(from, 'Maaf, link yang kamu kirim tidak valid. [Invalid Link]', id) }
                client.sendStickerfromUrl(from, url).then((r) => (!r && r !== undefined)
                    ? client.sendText(from, 'Maaf, link yang kamu kirim tidak memuat gambar. [No Image]')
                    : client.reply(from, 'Here\'s your sticker')).then(() => console.log(`Sticker Processed for ${processTime(t, moment())} Second`))
            } else {
                await client.reply(from, 'Tidak ada gambar! Untuk membuka daftar perintah kirim #menu [Wrong Format]', id)
            }
            break
        }
        case 'stikergif':
        case 'stickergif':
        case 'gifstiker':
        case 'gifsticker': {
            if (args.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            const isGiphy = url.match(new RegExp(/https?:\/\/(www\.)?giphy.com/, 'gi'))
            const isMediaGiphy = url.match(new RegExp(/https?:\/\/media.giphy.com\/media/, 'gi'))
            if (isGiphy) {
                const getGiphyCode = url.match(new RegExp(/(\/|\-)(?:.(?!(\/|\-)))+$/, 'gi'))
                if (!getGiphyCode) { return client.reply(from, 'Gagal mengambil kode giphy', id) }
                const giphyCode = getGiphyCode[0].replace(/[-\/]/gi, '')
                const smallGifUrl = 'https://media.giphy.com/media/' + giphyCode + '/giphy-downsized.gif'
                client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                    client.reply(from, 'Here\'s your sticker')
                    console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                }).catch((err) => console.log(err))
            } else if (isMediaGiphy) {
                const gifUrl = url.match(new RegExp(/(giphy|source).(gif|mp4)/, 'gi'))
                if (!gifUrl) { return client.reply(from, 'Gagal mengambil kode giphy', id) }
                const smallGifUrl = url.replace(gifUrl[0], 'giphy-downsized.gif')
                client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                    client.reply(from, 'Here\'s your sticker')
                    console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                }).catch((err) => console.log(err))
            } else {
                await client.reply(from, 'maaf, untuk saat ini sticker gif hanya bisa menggunakan link dari giphy.  [Giphy Only]', id)
            }
            break
        }
        // Video Downloader
        case 'tiktok':
            if (args.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            if (!isUrl(url) && !url.includes('tiktok.com')) return client.reply(from, 'Maaf, link yang kamu kirim tidak valid. [Invalid Link]', id)
            await client.reply(from, `_Scraping Metadata..._ \n\n${menuEn.textDonasi()}`, id)
            downloader.tiktok(url).then(async (videoMeta) => {
                const filename = videoMeta.authorMeta.name + '.mp4'
                const caps = `*Metadata:*\nUsername: ${videoMeta.authorMeta.name} \nMusic: ${videoMeta.musicMeta.musicName} \nView: ${videoMeta.playCount.toLocaleString()} \nLike: ${videoMeta.diggCount.toLocaleString()} \nComment: ${videoMeta.commentCount.toLocaleString()} \nShare: ${videoMeta.shareCount.toLocaleString()} \nCaption: ${videoMeta.text.trim() ? videoMeta.text : '-'}`
                await client.sendFileFromUrl(from, videoMeta.url, filename, videoMeta.NoWaterMark ? caps : `⚠ Video tanpa watermark tidak tersedia. \n\n${caps}`, '', { headers: { 'User-Agent': 'okhttp/4.5.0', referer: 'https://www.tiktok.com/' } }, true)
                    .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            }).catch(() => client.reply(from, 'Gagal mengambil metadata, link yang kamu kirim tidak valid. [Invalid Link]', id))
            break
        case 'ig':
        case 'instagram':
            if (args.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            if (!isUrl(url) && !url.includes('instagram.com')) return client.reply(from, 'Maaf, link yang kamu kirim tidak valid. [Invalid Link]', id)
            // await client.reply(from, `_Scraping Metadata..._ \n\n${menuEn.textDonasi()}`, id)
            downloader.insta(url).then(async (data) => {
                if (data.type == 'GraphSidecar') {
                    if (data.image.length != 0) {
                        data.image.map((x) => client.sendFileFromUrl(from, x, 'photo.jpg', '', null, null, true))
                            .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                    if (data.video.length != 0) {
                        data.video.map((x) => client.sendFileFromUrl(from, x.videoUrl, 'video.jpg', '', null, null, true))
                            .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                } else if (data.type == 'GraphImage') {
                    client.sendFileFromUrl(from, data.image, 'photo.jpg', '', null, null, true)
                        .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                } else if (data.type == 'GraphVideo') {
                    client.sendFileFromUrl(from, data.video.videoUrl, 'video.mp4', '', null, null, true)
                        .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                }
            })
                .catch((err) => {
                    if (err === 'Not a video') { return client.reply(from, 'Error, tidak ada video di link yang kamu kirim. [Invalid Link]', id) }
                    client.reply(from, 'Error, user private atau link salah [Private or Invalid Link]', id)
                })
            break
        case 'twt':
        case 'twitter':
            if (args.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            if (!isUrl(url) & !url.includes('twitter.com') || url.includes('t.co')) return client.reply(from, 'Maaf, url yang kamu kirim tidak valid. [Invalid Link]', id)
            await client.reply(from, `_Scraping Metadata..._ \n\n${menuEn.textDonasi()}`, id)
            downloader.tweet(url).then(async (data) => {
                if (data.type === 'video') {
                    const content = data.variants.filter(x => x.content_type !== 'application/x-mpegURL').sort((a, b) => b.bitrate - a.bitrate)
                    const result = await urlShortener(content[0].url)
                    console.log('Shortlink: ' + result)
                    await client.sendFileFromUrl(from, content[0].url, 'video.mp4', `Link Download: ${result} \n\nProcessed for ${processTime(t, moment())} _Second_`, null, null, true)
                        .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                } else if (data.type === 'photo') {
                    for (let i = 0; i < data.variants.length; i++) {
                        await client.sendFileFromUrl(from, data.variants[i], data.variants[i].split('/media/')[1], '', null, null, true)
                            .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                }
            })
                .catch(() => client.sendText(from, 'Maaf, link tidak valid atau tidak ada media di link yang kamu kirim. [Invalid Link]'))
            break
        case 'fb':
        case 'facebook':
            if (args.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            if (!isUrl(url) && !url.includes('facebook.com')) return client.reply(from, 'Maaf, url yang kamu kirim tidak valid. [Invalid Link]', id)
            await client.reply(from, '_Scraping Metadata..._ \n\nTerimakasih telah menggunakan bot ini, kamu dapat membantu pengembangan bot ini dengan menyawer melalui https://saweria.co/donate/yogasakti atau mentrakteer melalui https://trakteer.id/red-emperor \nTerimakasih.', id)
            downloader.facebook(url).then(async (videoMeta) => {
                const title = videoMeta.response.title
                const thumbnail = videoMeta.response.thumbnail
                const links = videoMeta.response.links
                const shorts = []
                for (let i = 0; i < links.length; i++) {
                    const shortener = await urlShortener(links[i].url)
                    console.log('Shortlink: ' + shortener)
                    links[i].short = shortener
                    shorts.push(links[i])
                }
                const link = shorts.map((x) => `${x.resolution} Quality: ${x.short}`)
                const caption = `Text: ${title} \n\nLink Download: \n${link.join('\n')} \n\nProcessed for ${processTime(t, moment())} _Second_`
                await client.sendFileFromUrl(from, thumbnail, 'videos.jpg', caption, null, null, true)
                    .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            })
                .catch((err) => client.reply(from, `Error, url tidak valid atau tidak memuat video. [Invalid Link or No Video] \n\n${err}`, id))
            break
        // Other Command
        case 'meme':
            if ((isMedia || isQuotedImage) && args.length >= 2) {
                const top = arg.split('|')[0]
                const bottom = arg.split('|')[1]
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const getUrl = await uploadImages(mediaData, false)
                const ImageBase64 = await meme.custom(getUrl, top, bottom)
                client.sendFile(from, ImageBase64, 'image.png', '', null, true)
                    .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            } else {
                await client.reply(from, 'Tidak ada gambar! Untuk membuka cara penggnaan kirim #menu [Wrong Format]', id)
            }
            break
        case 'resi':
            if (args.length !== 2) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            const kurirs = ['jne', 'pos', 'tiki', 'wahana', 'jnt', 'rpx', 'sap', 'sicepat', 'pcp', 'jet', 'dse', 'first', 'ninja', 'lion', 'idl', 'rex']
            if (!kurirs.includes(args[0])) return client.sendText(from, `Maaf, jenis ekspedisi pengiriman tidak didukung layanan ini hanya mendukung ekspedisi pengiriman ${kurirs.join(', ')} Tolong periksa kembali.`)
            console.log('Memeriksa No Resi', args[1], 'dengan ekspedisi', args[0])
            cekResi(args[0], args[1]).then((result) => client.sendText(from, result))
            break
        case 'translate':
            if (args.length != 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            if (!quotedMsg) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            const quoteText = quotedMsg.type == 'chat' ? quotedMsg.body : quotedMsg.type == 'image' ? quotedMsg.caption : ''
            translate(quoteText, args[0])
                .then((result) => client.sendText(from, result))
                .catch(() => client.sendText(from, 'Error, Kode bahasa salah.'))
            break
        case 'ceklokasi':
            if (quotedMsg.type !== 'location') return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            console.log(`Request Status Zona Penyebaran Covid-19 (${quotedMsg.lat}, ${quotedMsg.lng}).`)
            const zoneStatus = await getLocationData(quotedMsg.lat, quotedMsg.lng)
            if (zoneStatus.kode !== 200) client.sendText(from, 'Maaf, Terjadi error ketika memeriksa lokasi yang anda kirim.')
            let data = ''
            for (let i = 0; i < zoneStatus.data.length; i++) {
                const { zone, region } = zoneStatus.data[i]
                const _zone = zone == 'green' ? 'Hijau* (Aman) \n' : zone == 'yellow' ? 'Kuning* (Waspada) \n' : 'Merah* (Bahaya) \n'
                data += `${i + 1}. Kel. *${region}* Berstatus *Zona ${_zone}`
            }
            const text = `*CEK LOKASI PENYEBARAN COVID-19*\nHasil pemeriksaan dari lokasi yang anda kirim adalah *${zoneStatus.status}* ${zoneStatus.optional}\n\nInformasi lokasi terdampak disekitar anda:\n${data}`
            client.sendText(from, text)
            break
        
        //Colony commands added by cosmopense    
        case 'mukesh':
            client.sendPtt(from,"..\\media\\audio\\anthass.mpeg")
            break
        case 'audio':
            let songnamelist = body.trim().split('#audio ')
            let songarg = body.trim().split('#audio ')[1]
            // let song_name=''
            // for (let i = 0; i < songnamelist.length; i++) {
            //     song_name+song_name+songnamelist[i]
            // }
            let downloader_script = '..\\utils\\mediadownloader.py'
            await execSync('python3 ' + downloader_script + ' ' +songarg, (erro,stdout,stderr) => { 
                console.log("Python file executed");
            });
            await client.sendPtt(from,"..\\media\\audio\\song.mp3")
        
            const audiofs = require('fs')
            audiofs.unlink("..\\media\\audio\\song.mp3", (err) => {
            if (err) {
                console.error(err)
                return
            }
            //file removed
            })
            break
        case 'audiodownload':
            let songarglist = body.trim().split('#audio ')
            let songargument = body.trim().split('#audio ')[1]
                // let song_name=''
                // for (let i = 0; i < songnamelist.length; i++) {
                //     song_name+song_name+songnamelist[i]
                // }
            let song_downloader_script = '..\\utils\\mediadownloader.py'
            await execSync('python3 ' + song_downloader_script + ' ' +songargument, (erro,stdout,stderr) => { 
                console.log("Python file executed");
            });
            await client.sendFile(from,"\..\\media\\audio\\song.mp3")
                
            const audiodownloadfs = require('fs')
            audiodownloadfs.unlink("..\\media\\audio\\song.mp3", (err) => {
            if (err) {
                console.error(err)
                return
                }
            //file removed
            })
            break   
        case 'theri':
            if (!isGroupMsg) return client.reply(from, 'Sorry, this command can only be used within the group! [Group Only]', id)
            if (mentionedJidList.length != 1) return client.sendLinkWithAutoPreview(from, "https://youtu.be/Ofg-kQzytWc", "Inna ketto:", id)
            let fs = require("fs")
            let theritext = fs.readFileSync("..\\handler\\message\\text\\therilist.txt")
            let textByLine = theritext.toString().split("\n")
            theri_ind = Math.floor((Math.random() * textByLine.length))
            await client.sendTextWithMentions(from, `@${mentionedJidList[0].replace('@c.us', '')} ${textByLine[theri_ind]}`)
            break

        case 'addtheri':
            let therinew = body.trim().split('#addtheri ')[1]
            let filep = require("fs")
            filep.appendFileSync("text\\therilist.txt", '\n' + therinew)
            client.reply(from, `${therinew} added`)
            break 

        case 'thericount':
            let countfile = require("fs")
            let countertext = countfile.readFileSync("text\\therilist.txt")
            let numlines = countertext.toString().split("\n")
            client.reply(from, `${numlines.length} therikal njan padichu `)
            break

        case 'therilist':
            let therifile = require("fs")
            let listeoftheri = therifile.readFileSync("text\\therilist.txt")
            let therilines = listeoftheri.toString().split("\n")
            client.reply(from, `Here are the top ${therilines.length} words you should know when talking to a Malayali:\n\n${listeoftheri}`)
            break
        
        case 'gaali':
            if (!isGroupMsg) return client.reply(from, 'Sorry, this command can only be used within the group! [Group Only]', id)
            // if (mentionedJidList.length != 1) return client.reply(from, 'Inna ketto: \n\n https://youtu.be/Ofg-kQzytWc', id)
            let gaalifs = require("fs")
            let gaalitext = gaalifs.readFileSync("text\\gaalilist.txt")
            let gaalitextByLine = gaalitext.toString().split("\n")
            gaali_ind = Math.floor((Math.random() * gaalitextByLine.length))
            if (mentionedJidList.length != 1) {return client.reply(from, `${gaalitextByLine[gaali_ind]}`, id)}
            else{
            await client.sendTextWithMentions(from, `@${mentionedJidList[0].replace('@c.us', '')} ${gaalitextByLine[gaali_ind]}`)}
            break
        
        case 'addgaali':
            let gaalinew = body.trim().split('#addgaali ')[1]
            let fileg = require("fs")
            fileg.appendFileSync("text\\gaalilist.txt", '\n' + gaalinew)
            client.reply(from, `${gaalinew} added`)
            break 
    
        case 'countbatabsdk':
            let gaalicountfile = require("fs")
            let gaalicountertext = gaalicountfile.readFileSync("text\\gaalilist.txt")
            let gaalinumlines = gaalicountertext.toString().split("\n")
            client.reply(from, `I have mastered ${gaalinumlines.length} gaalis`)
            break
        
        case 'gaalicount':
            client.reply(from,'ghinti nahi aati, dilli se hu bhenchod')
            break
    
        case 'gaalilist':
            let gaalifile = require("fs")
            let listeofgaali = gaalifile.readFileSync("text\\gaalilist.txt")
            let gaalilines = listeofgaali.toString().split("\n")
            client.reply(from, `Here are the top ${gaalilines.length} words you should know when talking to a cultured Indian:\n\n${listeofgaali}`)
            break

        case 'kum':
            client.reply(from, 'Aa pattipoori chathilee?', id)
            break

        case 'mannu':
        case 'mannuboobs':
        case 'boobs':     
            client.sendFileFromUrl(from, 'https://raw.githubusercontent.com/unnipv/eaglebot/main/mannu.jpeg','mannuboobs', null,null, true)
            break

        case 'sam':
        case 'kunjandi':     
            client.reply(from, 'Here\'s some kunjandi for you:', id)
            client.sendFileFromUrl(from, 'https://images-na.ssl-images-amazon.com/images/I/41upBzoVVaL._SX331_BO1,204,203,200_.jpg','micropp', null,null, true)
            break
        case 'thanks':
        case 'thenks':
        case 'Thanks':
            client.reply(from, 'You are melcow', id) 
            break
        case 'score':
            let team_name = body.trim().split('#score ')[1]
            let script_path = '..\\utils\\'
            function runScript(){
                return spawn('python3', [
                   "-u",
                   path.join(script_path, 'score_scraper.py'),
                  team_name
                ]);
             }
             const subprocess = runScript()
             // print output of script
             subprocess.stdout.on('data', (data) => {
                client.reply(from,`${data}`);
             });
            break

        case 'emojipasta':
            let copypasta = body.trim().split('#emojipasta ')[1]
            let path_to_script = '..\\EmojipastaBot\\src\\emojipastaprinter.py'
            // const { execSync } = require('child_process')
            execSync('python3 ' + path_to_script + ' ' +copypasta, (erro,stdout,stderr) => { 
                console.log("Python file executed");
              });
            
            // setTimeout(function(){ console.log("waiting"); }, 700);
            const lineReader = require('line-reader');
            lineReader.eachLine('..\\media\\emojipasta.txt', (line, last) => {
                  if (last===true)
                  client.reply(from,`${line}`)
            });
             break
        
        case 'addemoji':
            var emojiline = ''
            emojiline = '"' + emojiline+args[0].toString().toLowerCase() + '":' + '['
            for (let i = 1; i < args.length; i++){
                emojiline=emojiline+ '"' + args[i] + '"' 
                if(i!=args.length-1){
                    emojiline=emojiline+','
                }
            }
            emojiline=emojiline+']'
            let emojif = require("fs")
            emojif.appendFileSync("text\\emojilist.txt", '\n' + emojiline + ',')
            client.reply(from, `${emojiline} added`)
            break
        // Group Commands (group admin only)
        case 'kick':
            if (!isGroupMsg) return client.reply(from, 'Sorry, this command can only be used within the group! [Group Only]', id)
            if (!isGroupAdmins) return client.reply(from, 'Failed, this command can only be used by group admins! [Admin Group Only]', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Failed, please add the bot as a group admin! [Bot Not Admin]', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'Sorry, the message format is wrong, please check the menu. [Wrong Format]', id)
            if (mentionedJidList[0] === 'me') return await client.reply(from, 'Suicide is not the only option. Get help.', id)
            if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Sorry, the message format is wrong, please check the menu. [Wrong Format]', id)
            await client.sendTextWithMentions(from, `Request received, issued:\n${mentionedJidList.map(x => `@${x.replace('@c.us', '')}`).join('\n')}`)
            for (let i = 0; i < mentionedJidList.length; i++) {
                if (groupAdmins.includes(mentionedJidList[i])) return await client.sendText(from, 'Failed, you cannot remove the group admin.')
                await client.removeParticipant(groupId, mentionedJidList[i])
            }
            break
        case 'promote':
            if (!isGroupMsg) return await client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup! [Group Only]', id)
            if (!isGroupAdmins) return await client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup! [Admin Group Only]', id)
            if (!isBotGroupAdmins) return await client.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup! [Bot not Admin]', id)
            if (mentionedJidList.length != 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format, Only 1 user]', id)
            if (groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Maaf, user tersebut sudah menjadi admin. [Bot is Admin]', id)
            if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            await client.promoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Request diterima, menambahkan @${mentionedJidList[0].replace('@c.us', '')} sebagai admin.`)
            break
        case 'demote':
            if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup! [Group Only]', id)
            if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup! [Admin Group Only]', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup! [Bot not Admin]', id)
            if (mentionedJidList.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format, Only 1 user]', id)
            if (!groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Maaf, user tersebut tidak menjadi admin. [user not Admin]', id)
            if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            await client.demoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Request diterima, menghapus jabatan @${mentionedJidList[0].replace('@c.us', '')}.`)
            break
        case 'bye':
            if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup! [Group Only]', id)
            if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup! [Admin Group Only]', id)
            client.sendText(from, 'Good bye... ( ⇀‸↼‶ )').then(() => client.leaveGroup(groupId))
            break
        case 'del':
            if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup! [Admin Group Only]', id)
            if (!quotedMsg) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            if (!quotedMsgObj.fromMe) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            client.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
            break
        case 'tagall':
        case 'everyone':
            /**
            * This is Premium feature.
            * Check premium feature at https://trakteer.id/red-emperor/showcase or chat Author for Information.
            */
            client.reply(from, 'ehhh, what\'s that???', id)
            break
        case 'botstat': {
            const loadedMsg = await client.getAmountOfLoadedMessages()
            const chatIds = await client.getAllChatIds()
            const groups = await client.getAllGroups()
            client.sendText(from, `Status :\n- *${loadedMsg}* Loaded Messages\n- *${groups.length}* Group Chats\n- *${chatIds.length - groups.length}* Personal Chats\n- *${chatIds.length}* Total Chats`)
            break
        }

        default:
            console.log(color('[ERROR]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Unregistered Command from', color(pushname))
            break
        }
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
    }
}
