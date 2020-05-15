const fs = require('fs');
const path = require('path');
const commentKey = '[//]: # (fragment-list)\n'


let md = fs.readFileSync('./README.md').toString().split(commentKey);

let tableHeader = ['文件', '描述'];
let tableBody = [];

['js'].map(dirname => {
    let dir = path.join(__dirname, dirname)
    let files = fs.readdirSync(dir)

    files.map(filepath => {
        let file = fs.readFileSync(path.join(dir, filepath)).toString()
        let comment = file.match(/\/\*+([\s\S]*?)\*+\//)[1]
        let description = comment.replace(/^[\s\/\*]+/mg, '').match(/@description([\s\S]*?)@/)[1].trim()
        tableBody.push([path.join(dirname, filepath), description])
    })
})

function sp(str) {
    if (str instanceof Array) str = str.join('|')
    return `|${str}|`
}

let table = [sp(tableHeader), sp(Array(tableHeader.length).fill('--')), ...tableBody.map(sp)].join('\n')

md[1] = table

fs.writeFileSync('./README.md', md.join(commentKey))

console.log(['生成成功'])