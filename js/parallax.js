//--------------Header-------------

//Récupération de la div dans une constante à laquelle appliquer l'effet
const parallax_1 = document.querySelector("#parallax_1");
//Ajout de l'évènement scroll 
window.addEventListener("scroll", function(){
//Création d'une variable pour définir l'action sur l'axe Y
    let offset = window.pageYOffset;
//on modifie la position du background de la constante sur l'axe Y 
    parallax_1.style.backgroundPositionY = offset * 0.8 + "px";
});


//--------------3ème section-------------------------

const parallax_2 = document.querySelector("#parallax_2");

window.addEventListener("scroll", function(){
    let offset2 = window.pageYOffset;
    parallax_2.style.backgroundPositionY = offset2 * 0.8 + "px";
});

