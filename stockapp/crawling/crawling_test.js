const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const log = console.log;
const db = require('../config/DB');

var idx = 0;
var result = [];

for(let i = 1; i < 21; i++) {
    axios({
        url: 'https://finance.naver.com/sise/entryJongmok.naver?&page=' + i,
        method: 'GET',
        responseType: 'arraybuffer',
    })
    .then(response => {
        try {
            let list = [];
            const content = iconv.decode(response.data, 'EUC-KR');
            const $ = cheerio.load(content);
            const $bodyList = $("div.box_type_m table.type_1 tbody").children('tr');
            
            $bodyList.each(function(i, elm) {
                let c_name = $(this).find('td.ctg').text();
                let link = $(this).find('td.ctg').find('a').attr('href');
                if(typeof(link) == 'string')
                    link = link.split('=')[1];

                list[i] = {
                    name : c_name, 
                    code : link,
                };
            });
    
            const data = list.filter(n => n.code);
            return data;
        } catch(err) {
            console.error(err);
        }
    })
    .then(res => {
        for(let j = 0; j < 10; j++) {
            axios({
                url: 'https://navercomp.wisereport.co.kr/v2/company/c1010001.aspx?cmp_cd=' + res[j].code,
                method: 'GET',
                responseType: 'arraybuffer',
            })
            .then(response => {
                const content = response.data;
                const $ = cheerio.load(content);
                const $bodyList = $('div.body-section form#Form1 div#all_contentWrap div#contentWrap div#pArea div.PageContainer div.PageContentContainer').children('div#wrapper');

                let d = $($bodyList).find('div.all-width').find('div.cmp_comment').find('ul.dot_cmp').find('li').text().split('.')[0];
                let is = $($bodyList).find('div.wrapper-row').find('div.fl_le.half').find('div.body').find('table').find('tbody').find('tr')[6];

                result.push(
                    {
                        idx : idx,
                        stock_code : res[j].code,
                        c_name : res[j].name,
                        c_description : d,
                        issued_shares : Number($(is).children('td.num').text().trim().split('주')[0]
                        .match(/[\d,]+/)[0]
                        .replace(/,/g, '')),
                    }
                );
                idx++;
                
                if(idx == 200) {
                    for(let i = 0; i < 200; i++) {
                        var code = result[i].stock_code;
                        var name = result[i].c_name;
                        var desc = result[i].c_description;
                        var shares = result[i].issued_shares;

                        const datas = [code, name, desc, shares, shares];

                        db.query('INSERT INTO c_info VALUES(?, ?, ?, ?) ON DUPLICATE KEY UPDATE issued_shares = ?', datas);
                    }
                    log("successfully inserted !");
                    db.end();
                }
            });
        }
    });
}