"use strict";

const cont = document.querySelector(".container");
const menu = document.querySelector(".menu");
const input = document.querySelectorAll(".memberData");
const members = [];
//Inicijalizacija canvasa koja se poziva na pocetku (linija 23)
const initCanvas = (id, w, h) => {
  return new fabric.Canvas(id, {
    width: w,
    height: h,
  });
};

//funkcija za postavljanje pozadine canvasa
const setBackground = (url, canvas) => {
  return fabric.Image.fromURL(url, (img) => {
    canvas.backgroundImage = img;
    canvas.renderAll();
  });
};

const canvas = initCanvas("canvas", 1000, 700);

////////////////////////////////////////////
/////////////////////////////////////////
//Nacini rada koje korisnik moze odabrati sa palete
//!!Potrebno uljepsavanje, nije bas intuitivno
const modes = {
  select: "select", //Uradjen
  line: "line", //Uradjen
  free: "free", //Uradjen
  rect: "rect", //Uradjen
  circle: "circle", //Uradjen
  curve: "curve",
  text: "text", //Uradjen
  erase: "erase",
  member: "member", //Uradjen nakaradno
};

//Trenutni nacina rada odabran sa palete
let currentMode;

//Biranje nacina rada, mijenajanje vrijednosti currentMode
//toggleMode je postavljen koa eventHandler na .menu element, koristi se DOM bubbling
const toggleMode = function (mode) {
  //For petlja iterira kroz svaki atribut u objektu modes
  for (let [key, value] of Object.entries(modes)) {
    if (mode === key) {
      //resetovanje opcija//
      canvas.isDrawingMode = false;
      input.forEach((el) => {
        el.classList.remove("active");
      });
      if (currentMode === value) {
        currentMode = "";
      } else {
        currentMode = value;

        //Odabiramo ovog nacina rada omogucavamo oznacivanje objekata na canvasu
        if (currentMode == modes.select) {
          //Ako je ukljucen select mode omogucavamo korisniku da oznaci objekte na cavasu, selectable se
          // postavlja na false unutar object literal u draw'obj' funkcijama
          for (const [_, obj] of Object.entries(canvas.getObjects()))
            obj.selectable = true;
        } else {
          //U slucaju da smo odabrali neki drugi mode slectable se postavlja na false
          for (const [_, obj] of Object.entries(canvas.getObjects()))
            obj.selectable = false;
        }
        //Nije moguce pokrenuti crtanje slobodnom rukom u drawing funkciji.
        //Iako mozemo uspjesno mijenjat vrijednost isDrawingMode unutar drawing funkcije, ocekivano crtanje po canvasu
        //ce se aktivirati tek kada se desi click event.
        if (currentMode == modes.free) {
          canvas.isDrawingMode = true;
        }
        //Omogucava brisanje citavog canvasa
        if (currentMode === modes.erase) {
          canvas.clear();
        }

        //Ako smo odabrali member mode pojavljuju se inputi za clana
        if (currentMode === modes.member) {
          input.forEach((el) => {
            el.classList.add("active");
          });
        }
      }
    }
  }
  //Azuriranje promjena
  canvas.renderAll();
};

/////////////////////////////////////////
////////////////////////////////////////

//funkcija koja mijenja x1,y1,x2,y2 tacke, points je niz koji se definise u drawing funkciji kada se
//aktivira mouse:up event. [0] i [1] odredjuju koordinate pocetka crtanja objekta a kada se od
//2] i [3] oduzme [1] i [2] dobija se sirina i visina objekta
const switchPoints = function (points) {
  const temp = [...points];

  points[0] = temp[2];
  points[1] = temp[3];
  points[2] = temp[0];
  points[3] = temp[1];
};

//Funkcija za crtanje pravih linija
const drawLine = function (points) {
  return new fabric.Line([...points], {
    fill: "black",
    stroke: "1px",
    selectable: false,
  });
};

//funkcija za crtanje kvadra, poziva se u drawing() na mouse:up eventu
//!!Poboljsaj izbor
const drawRect = function (points) {
  //Ako je korisnik krenuo crtati kvadar od desna prema lijevo pojavit ce se greska
  // Ako imamo da je x1,y1=(200,300) i x2,y2=(100,50), kada odredjujemo duzinu i visinu po
  //formuli x2-x1 i y2-y1 dobit cemo negativne brojeve koji ce uzrokovati gresku zato se x1,x2 i y1,y2 zamijene
  if (points[0] > points[2]) {
    switchPoints(points);
  }
  return new fabric.Rect({
    left: points[0],
    top: points[1],
    width: points[2] - points[0],
    height: points[3] - points[1],
    fill: "",
    stroke: "1px",
    selectable: false,
  });
};

//funkcija za crtanje kruga koja se pozica u drawing() na 'mouse:up'
const drawCircle = function (points) {
  //Ako je x1>x2 poluprecnik dobijen formulom x2-x1 ce biti negativan
  if (points[0] > points[2]) {
    switchPoints(points);
  }
  return new fabric.Circle({
    left: points[0],
    top: points[1],
    radius: (points[2] - points[0]) / 2,
    fill: "",
    stroke: "1px",
    selectable: false,
  });
};

//Funkcija za dodavanje teksta,
//!! width i height ne rade
const addText = function (points) {
  return new fabric.IText("type...", {
    left: points[0],
    top: points[1],
    width: points[2] - points[0],
    height: points[3] - points[1],
    fill: "green",
    borderColor: "black",
    border: "2px",
  });
};

//funkcija za dodavanje cljana porodice na porodicno stablo
//!!Poboljsati izbor boja i fontova
const addMember = function (points) {
  //Podaci o clanu: ime,prezime,rodjenje, smrt
  const memberData = [];
  //Referenciranje input elemenata koji se nalaze u meniju
  const input = menu.querySelectorAll(".memberData");
  //U memberData niz se ucitavaju unosi iz input elemenata na meniju
  input.forEach((el) => {
    memberData.push(el.value);
  });

  let validInput = true;

  //validacija da li su svi parametri uneseni
  for (let i = 0; i < memberData.length; i++) {
    console.log(memberData[i]);
    if (memberData[i] == "") {
      validInput = false;
      return;
    }
  }

  if (!validInput) return;
  //Instanciranje texta koji predstavlja ime i prezime clana
  const nameAndSurname = new fabric.IText(`${memberData[0]} ${memberData[1]}`);
  //Instanciranje teksta koji predstavlja godiste?? clana
  const age = new fabric.Text(`(${memberData[2]}-${memberData[3]})`, {
    fontSize: 20,
  });

  //Instanciranje kvadra koji predstavlja pozadinu za informacije o clanu
  //
  const box = new fabric.Rect({
    left: points[0],
    top: points[1],
    width: nameAndSurname.width + 10,
    height: 100,
    backgroundColor: "purple",
    fill: "",
  });

  //Pozicija nameAndSurname se postavljaju relativno na box poziciju
  nameAndSurname.left = box.left + 5;
  nameAndSurname.top = box.top + 5;
  nameAndSurname.backgroundColor = "red";

  //Ista stvar kao i sa nameAndSurname
  age.left = box.left + box.width / 2 - age.width / 2;
  age.top = box.top + box.height / 2 + 20;
  age.backgroundColor = "white";

  //Grupisanje objekata, nakon ove naredbe svi navedeni objekti ce biti tretirani kao jedan prilikom selekcije
  const group = new fabric.Group([box, nameAndSurname, age]);

  input.forEach((el) => (el.value = ""));
  return group;
};

//Promjenjiva koja prati stanje misa
let mousePressed = false;
let lastObj;
//Najvaznija funckcija za crtanje po canvasu.
//!Pokusat napravit bolju verziju ove funkcije kad uspijes napravit sve opcije
const drawing = function (canvas) {
  //Promjenjive koje prate pocetne (x,y) vrijednosti kada korisnik klikne na canvas
  let beginX, beginY;
  canvas.on("mouse:down", function (event) {
    //Omogucava crtanje po canvasu
    mousePressed = true;

    //pointer(x,y) vrijednosti u sebi vec imaju izracunat offset canvasa.
    //Offset odredjuje udaljenos canvasa od lijeve i desne strane window objekta tako da koordinate koje dobijemo
    // u canvasu pocinju od (0,0)
    beginX = event.pointer.x;
    beginY = event.pointer.y;
  });

  //!Trenutno nista ne radi ali trebat ce kada budem uljepsavo GUI
  canvas.on("mouse:move", function (event) {
    if (!mousePressed) return;

    endX = event.pointer.x;
    endY = event.pointer.y;
  });

  //Promjenjive koje prate koordinate misa kada se mis zaustavi i lijevi taster se podigne
  let endX, endY;
  canvas.on("mouse:up", function (event) {
    //Ako nije spusten lijevi taster misa iskace se iz funkcije
    if (!mousePressed) return;

    //Aktivni objekat ce biti posljednji koji je dodan na canvas
    if (canvas.getActiveObject()) return;
    //Zavrsne vrijednosti koordinata misa
    endX = event.pointer.x;
    endY = event.pointer.y;

    //Pocetne i krajnje vrijendosti koordinata se stavljaju u niz zbog lakseg unosenje parametara u funkcije
    const points = [beginX, beginY, endX, endY];
    //Opcija za crtanje linije na canvasu

    if (!(points[0] != points[2]) && !(points[1] != points[3])) {
      return;
    }
    if (currentMode === modes.line) {
      const line = drawLine(points);
      canvas.add(line);
    }

    //Opcija za crtanje kvadra na canvasu
    if (currentMode === modes.rect) {
      const rect = drawRect(points);
      canvas.add(rect);
    }

    //Opcija za crtanje kruga na canvasu
    if (currentMode === modes.circle) {
      const circle = drawCircle(points);

      canvas.add(circle);
    }

    if (currentMode === modes.text) {
      if (!canvas.getActiveObject() && beginX != endX && beginY != endY) {
        const text = addText(points);

        canvas.add(text);
      }
    }

    if (currentMode === modes.member) {
      const member = addMember(points);

      if (member) {
        members.push(member);
        canvas.add(member);
      }
    }

    //Ponovo crta sve elemente na canvas
    canvas.renderAll();

    // posljednji objekt koji je napravljen ce biti odabran zbog
    lastObj = canvas.getObjects()[canvas.getObjects().length - 1];
    canvas.setActiveObject(lastObj);

    mousePressed = false;
  });
};

drawing(canvas);
/////////////////////////////////////////
////////////////////////////////////////

/////////////////////////////////////////

//Event za biranje opcija na meniju
menu.addEventListener("click", function (event) {
  //Kada je korisnik kliknuo na neki element trazi se najblizi .mode element
  const button = event.target.closest(".mode");
  if (!button) return;

  //Prekida trenutno selektovan objekt
  canvas.discardActiveObject();

  //Mijenjanje currentMode
  toggleMode(button.classList[1]);

  //
});
