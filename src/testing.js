const axios = require("axios")
const fs = require("fs")
const puppeteer = require("puppeteer")


/*
axios.get("https://mangasee123.com/manga/Onepunch-Man").then(function(response){
    fs.writeFile("test.txt", response.data, (err) => {
        if (err)
          console.log(err);
        else {
          console.log("File written successfully\n");
        }
    })
})
*/

async function fetch(link){
    //const browser = await puppeteer.launch({headless: false});
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(link);
    const content = await page.content();

    
    fs.writeFile("test.txt", content, (err) => {
        if (err)
          console.log(err);
        else {
          console.log("File written successfully\n");
        }
    })
    

    //const regex = /\/read-online\/.*?chapter-(.*?)-page-1\.html/g
    //const chapterObjects = [...content.matchAll(regex)].map(page => ({["chapter "+ page[1]]: "https://mangasee123.com" + page[0].replace("-page-1", "")}))
    //console.log(chapterObjects)


    const regex = /https:\/\/official-ongoing-2.gamindustri.us\/manga\/.*?\.png/g
    const duplicatedPageLinks = [...content.matchAll(regex)].map(page => page[0])
    let pageLinks = []
    for (var i = 0; i < duplicatedPageLinks.length-6; i = i+2) {
        pageLinks.push(duplicatedPageLinks[i]);
    };
    const pageLinkObjects = pageLinks.map(link => ({"original": link}))

    console.log(pageLinkObjects)

    browser.close()
}

fetch("https://mangasee123.com/read-online/Onepunch-Man-chapter-157-index-2.html")



