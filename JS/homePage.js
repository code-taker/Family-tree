"use strict";

//Selektori
const main = document.querySelector("main");
const searchBtn = document.querySelector(".search");
const exitBtn = document.querySelector(".exit");

//Pritiskom na Search pojavljuje se meni za pretragu
searchBtn.addEventListener("click", function () {
  const arr = [...main.children];

  arr.forEach((el) => {
    el.classList.contains("hide")
      ? el.classList.remove("hide")
      : el.classList.add("hide");
  });
});

//Pritiskom na dugme X izlazi se iz menia za pretragu
exitBtn.addEventListener("click", function () {
  let arr = [...main.children];

  arr.forEach((el) => {
    !el.classList.contains("hide")
      ? el.classList.add("hide")
      : el.classList.remove("hide");
  });
});
