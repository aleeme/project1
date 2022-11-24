var express = require('express')
var router = express.Router();
var auth = require('../lib/auth');
var watchListController = require('../controllers/watchListController');
const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

router.get('/', function(req, res) {
    var results = [];
    for (let i = 1; i < 21; i++) {
        axios({
                url: 'https://finance.naver.com/sise/entryJongmok.naver?&page=' + i,
                method: 'GET',
                responseType: 'arraybuffer',
            })
            .then(response => {
                try {
                    const content = iconv.decode(response.data, 'EUC-KR');
                    const $ = cheerio.load(content);
                    const $bodyList = $("div.box_type_m table.type_1 tbody").children('tr');

                    $bodyList.each(function(i, elm) {
                        let c_name = $(this).find('td.ctg').text();
                        let link = $(this).find('td.ctg').find('a').attr('href');
                        let now = $(this).find('td.number_2')[0];
                        let s = $(this).find('td.rate_down2').find('img').attr('alt') == "상승" ? 1 : 0;
                        let chg = $(this).find('td.rate_down2 span').text();
                        let chgp = $(this).find('td.number_2')[1];
                        let vol = $(this).find('td.number').text();
                        let trading_val = $(this).find('td.number_2')[2];
                        let total_val = $(this).find('td.number_2')[3];

                        if (typeof(link) == 'string')
                            link = link.split('=')[1];

                        results.push({
                            name: c_name,
                            code: link,
                            now_val: $(now).text(),
                            s: s,
                            chg: chg.replace(/["\t", "\n"]/g, ''),
                            chgp: $(chgp).text().replace(/["\t", "\n"]/g, ''),
                            vol: vol,
                            trading_val: $(trading_val).text(),
                            total_val: $(total_val).text()
                        });
                    });

                    results = results.filter(n => n.code);
                    console.log(results.length);
                    if (results.length == 200) {
                        if (auth.isOwner(req, res)) {
                            res.render('markets', { userId: req.user.user_id, stocks: results });
                        } else {
                            res.render('markets', { stocks: results });
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            })
    }
});


router.get('/:item_code', function(req, res) {
    axios({
            url: 'https://finance.naver.com/item/main.naver?code=' + req.params.item_code,
            method: 'GET',
            responseType: 'arraybuffer',
        })
        .then(response => {
            try {
                const content = iconv.decode(response.data, 'EUC-KR');
                const $ = cheerio.load(content);

                const $now = $("#chart_area > div.rate_info > div > p.no_today > em").children("span")[0];
                const $closed = $("#chart_area > div.rate_info > table > tbody > tr:nth-child(1) > td.first > em").children("span")[0];
                const $open = $("#chart_area > div.rate_info > table > tbody > tr:nth-child(2) > td.first > em").children("span")[0];
                const $high = $("#chart_area > div.rate_info > table > tbody > tr:nth-child(1) > td:nth-child(2) > em").children("span")[0];
                const $low = $("#chart_area > div.rate_info > table > tbody > tr:nth-child(2) > td:nth-child(2) > em:nth-child(2)").children("span")[0];
                const $vol = $("#chart_area > div.rate_info > table > tbody > tr:nth-child(1) > td:nth-child(3) > em").children("span")[0];
                const $val = $("#chart_area > div.rate_info > table > tbody > tr:nth-child(2) > td:nth-child(3) > em").children("span")[0];

                let name = $("#middle > div.h_company > div.wrap_company > h2 > a").text();
                let now = $($now).text();
                let closed = $($closed).text();
                let open = $($open).text();
                let high = $($high).text();
                let low = $($low).text();
                let vol = $($vol).text();
                let val = $($val).text();

                var item_info = {
                    code: req.params.item_code,
                    name: name,
                    now: now,
                    closed: closed,
                    open: open,
                    high: high,
                    low: low,
                    vol: vol,
                    val: val
                }

                if (auth.isOwner(req, res)) {
                    watchListController.FindInWatchList(req.user.id, req.params.item_code, 1, (found) => {
                        if (found) { // watchlist에 이미 있음
                            res.render('stockItem', { userId: req.user.user_id, item: item_info, text: "관심목록에 추가됨", disabled: "disabled" });
                        } else { // watchlist에 없음
                            res.render('stockItem', { userId: req.user.user_id, item: item_info, text: "관심 목록에 추가", disabled: "" });
                        }
                    })
                } else {
                    res.render('stockItem', { item: item_info, text: "관심 목록에 추가", disabled: "" });;
                }
            } catch (err) {
                console.error(err);
            }
        })
});

router.get('/:item_code/add_to_watchlist', function(req, res) {
    if (req.user) {
        watchListController.AddToWatchList(req.user.id, req.params.item_code, 1, function() {
            res.redirect(`/markets/${req.params.item_code}`);
        });
    } else {
        res.redirect("/auth/loginRequired");
    }
});

module.exports = router;