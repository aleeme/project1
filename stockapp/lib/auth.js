module.exports = {
    // 로그인이 되어있는 경우에만 허용할 때 사용
    isOwner: function (request, response) {
        if (request.user) {
            return true;
        }
        else {
            return false;
        }
    }
}