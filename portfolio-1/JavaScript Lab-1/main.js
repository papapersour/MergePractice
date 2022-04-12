$(function(){
    $("input").on("click",function(){
    //alert("Hi");
    var numberOfListItem = $("li").length;
    var randomChildNumber = Math.floor(Math.random()*numberOfListItem);
    $("h1").text($("li").eq(randomChildNumber).text());
    if(randomChildNumber==0)
    document.getElementById("d1").innerHTML="<img src='https://storage.googleapis.com/www-cw-com-tw/article/202101/article-5ff76e12dff12.jpg'>";
    else if(randomChildNumber==1)
    document.getElementById("d1").innerHTML="<img src='https://www.ivy.com.tw/ivy_mall_backend/uploadfile/5f9244d34e002546333338.jpg'>";
    else
    document.getElementById("d1").innerHTML="<img src='https://shop.8way.com.tw/images/ProSlide/P001/Pork-Dumpling.png'>";
    });
    });