import { util } from './util.js';
import { like } from './like.js';
import { guest } from './guest.js';
import { theme } from './theme.js';
import { audio } from './audio.js';
import { comment } from './comment.js';
import { progress } from './progress.js';
import { pagination } from './pagination.js';

document.addEventListener('DOMContentLoaded', () => {
    audio.init();
    theme.init();
    pagination.init();

    guest.init();
    progress.init();
    window.AOS.init();

    window.util = util;
    window.like = like;
    window.guest = guest;
    window.theme = theme;
    window.audio = audio;
    window.comment = comment;
    window.pagination = pagination;
});

    // Thay đổi thời gian tại đây (ngày cưới)
    const countDownDate = new Date("2024-11-02T12:30:00").getTime();

    // Cập nhật đồng hồ đếm ngược mỗi giây
    const x = setInterval(function() {
        // Lấy thời gian hiện tại
        const now = new Date().getTime();
        console.log(now);
        
        // Tính toán khoảng thời gian còn lại
        const distance = countDownDate - now;

        // Tính toán ngày, giờ, phút và giây
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Hiển thị kết quả trong các phần tử HTML
        document.getElementById("day").innerHTML = days;
        document.getElementById("hour").innerHTML = hours;
        document.getElementById("minute").innerHTML = minutes;
        document.getElementById("second").innerHTML = seconds;

        // Nếu thời gian kết thúc, hiển thị thông báo
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("count-down").innerHTML = "Đến giờ cưới!";
        }
    }, 1000);
