$(function() {
    var e = 1,
        f = 1,
        g = 1,
        b = $("#menu"),
        h = b.offset().top,
        d = $("footer").offset().top - b.height();
    $("#flash").on("click", ".close", function(a) {
        a.preventDefault();
        $("#flash").css({
            opacity: 1
        }).animate({
            opacity: 0
        }, 500, "linear", function() {
            $("#flash").hide();
            h = b.offset().top;
            d = $("footer").offset().top - b.height()
        })
    });
    $(window).on("scroll", function(a) {
        a = $(window).scrollTop();
        var c = b.offset().top;
        d = $("footer").offset().top - b.height();
        b.hasClass("fixed") ? (c < h && b.removeClass("fixed"), a <= d && b.removeClass("bottom"),
        c > d && b.addClass("bottom")) : c <= a && b.addClass("fixed")
    });
    $("#news.more-link").click(function(a) {
        a.preventDefault();
        if (0 === $(".style-blue").find(".nomore").length) {
            var c = this;
            $(this).addClass("loading-start");
            $.get($(this).attr("href") + e, function(a) {
                e++;
                $(".style-blue .section-bottom").before($(a));
                $(".ajax").animate({
                    opacity: 1
                }, function() {
                    $(".ajax").removeClass("ajax");
                    $(c).removeClass("loading-start");
                    d = $("footer").offset().top - b.height()
                })
            })
        }
    });
    $("#congratulations.more-link").click(function(a) {
        a.preventDefault();
        if (0 === $(".style-green").find(".nomore").length) {
            var c = this;
            $(this).addClass("loading-start");
            $.get($(this).attr("href") + f, function(a) {
                f++;
                $(".style-green .section-bottom").before($(a));
                $(".ajax").animate({
                    opacity: 1
                }, function() {
                    $(".ajax").removeClass("ajax");
                    $(c).removeClass("loading-start");
                    d = $("footer").offset().top - b.height()
                })
            })
        }
    });
    $("#media.more-link").click(function(a) {
        a.preventDefault();
        if (0 === $(".style-yellow").find(".nomore").length) {
            var c = this;
            $(this).addClass("loading-start");
            $.get($(this).attr("href") +
                g,
                function(a) {
                    g++;
                    $(".style-yellow .section-bottom").before($(a));
                    $(".ajax").animate({
                        opacity: 1
                    }, function() {
                        $(".ajax").removeClass("ajax");
                        $(c).removeClass("loading-start");
                        d = $("footer").offset().top - b.height()
                    })
                })
        }
    });
    $("aside .small").on("click", "#fb-like a, #vk-like a", function(a) {
        a.preventDefault();
        window.open(this.href, "", "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600,top=" + (screen.height / 2 - 150) + ",left=" + (screen.width / 2 - 300))
    });
});