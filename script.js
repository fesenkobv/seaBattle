//ОБЪЕКТ ПРЕДСТАВЛЕНИЕ
var view = {
    displayMessage: function (msg) {
        var messageArea = document.getElementById("messageArea");
        messageArea.innerHTML = msg;

    },
    displayHit: function (location) {
        var cell = document.getElementById(location);
        cell.setAttribute("class", "hit");
    },
    displayMiss: function (location) {
        var cell = document.getElementById(location);
        cell.setAttribute("class", "miss");
    }
};

//ОБЪЕКТ МОДЕЛЬ
var model = {
    boardSize: 7,//размер игрового поля
    numShips: 3,//количество кораблей
    shipLength: 3,//размер корабля в клетках
    shipsSunk: 0,//количество потопленных кораблей
    ships: [{ locations: ["0", "0", "0"], hits: ["", "", ""] },
    { locations: ["0", "0", "0"], hits: ["", "", ""] },
    { locations: ["0", "0", "0"], hits: ["", "", ""] }
    ],
    fire: function (guess) {//метод выстрела, получение координат выстрела
        for (var i = 0; i < this.numShips; i++) {//перебор массива кораблей
            var ship = this.ships[i];//поочередное получение данных кораблей
            //var locations = ship.locations;//получение массива locations
            //var index = locations.indexOf(guess);//поиск координат в массиве locations
            var index = ship.locations.indexOf(guess);//сцепление
            if (index >= 0) {
                ship.hits[index] = "hit";
                view.displayHit(guess);
                view.displayMessage("Попал!");
                if (this.isSunk(ship)) {
                    view.displayMessage("Ты потопил мой корабль!");
                    this.shipsSunk++;
                }
                return true;
            }
        }
        view.displayMiss(guess);
        view.displayMessage("Ты промазал!");
        return false;
    },
    isSunk: function (ship) {//метод проверки корабля утонул / не утонул (проверить как передается объект ship)
        for (var i = 0; i < this.shipLength; i++) {
            if (ship.hits[i] != "hit") {
                return false
            }
        }
        return true;
    },
    generateShipLocations: function () {//метод создания кораблей
        var locations;
        for (var i = 0; i < this.numShips; i++) {// numShips - количество кораблей
            do {
                locations = this.generateShip();//метод для генерации первого корабля (заноситсся в массив locations)
            } while (this.collision(locations));//метод проверки перекрытий кораблей
            this.ships[i].locations = locations;
        }

    },
    generateShip: function () {//создание массива с координатами кораблей
        var direction = Math.floor(Math.random() * 2);//выбор горизонтальности или вертикальности корабля
        var row, col;//row - строка col - столбец
        //начало генерации первой пары координат корабля
        if (direction === 1) {//горизонтальный корабль
            var Y = Math.random();
            //console.log(Y);
            row = Math.floor(Y * this.boardSize);//строка - Y; boardSize - размер игрового поля
            var X = Math.random();
            //console.log(X);
            col = Math.floor(X * (this.boardSize - this.shipLength));//строка - X; shipLength - размер корабля
        } else {//вертикальный корабль
            var Y = Math.random();
            //console.log(Y);
            row = Math.floor(Y * (this.boardSize - this.shipLength));//строка - Y
            var X = Math.random();
            //console.log(X);
            col = Math.floor(X * this.boardSize);//строка - X
        }
        //конец генерации первой пары координат корабля

        //начало добавления оставшихся пар координат корабля
        var newShipLocations = [];//объявление массива
        for (var i = 0; i < this.shipLength; i++) {
            if (direction === 1) {
                //добавление в массив для горизонтального корабля
                newShipLocations.push(row + "" + (col + i));
            } else {
                //добавление в массив для вертикального корабля
                newShipLocations.push((row + i) + "" + col);
            }
        }
        return newShipLocations;
    },

    //РАЗОБРАТЬСЯ

    collision: function (locations) {//проверка на перекрытие
        for (var i = 0; i < this.numShips; i++) {
            var ship = model.ships[i];
            for (var j = 0; j < locations.length; j++) {
                //ОСОБЕННО В ЭТОМ
                if (ship.locations.indexOf(locations[j]) >= 0) {
                    return true;
                }
            }
        }
        return false;
    }
}

//ОБЪЕКТ КОНТРОЛЛЕР
var controller = {
    guesses: 0,//попытки выстрелов
    processGuess: function (guess) {
        var location = parseGuess(guess);
        if (location) {
            this.guesses++;
            var hit = model.fire(location);
            if (hit && model.shipsSunk === model.numShips) {
                view.displayMessage("Ты потопил все мои корабли " + this.guesses + " выстрелами")
            }
        }
    }
};

function parseGuess(guess) {//функция по проверке и преобразованию координат выстрела
    var alphabet = ["a", "b", "c", "d", "e", "f", "g"];//массив для получения индекса по букве
    if (guess === null || guess.length !== 2) {//проверка на адекватность и формат введенной координаты
        alert("Введите координаты выстрела корректно в формате f3");
    } else {
        var firstChar = guess.charAt(0);//извлечение первого символа строки
        var row = alphabet.indexOf(firstChar);//получение индекса (преобразование первого символа) через массив alphabet / отсчет индекса начинается с нуля
        var column = guess.charAt(1);
        //получение второго числа
        if (isNaN(row) || isNaN(column)) {//верификация значений
            alert("Внимание, таких координат нет на доске");
        } else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {//проверка на интервал от 0 до 6
            alert("Внимание, таких координат нет на доске");
        } else {
            return row + column;
        }
    }
    return null;
};


function init() {
    var fireButton = document.getElementById("fireButton");
    fireButton.onclick = handleFireButton;//событие по нажатию кнопки мыши
    var guessInput = document.getElementById("guessInput");
    guessInput.onkeypress = handlKeyPress;

    var fireArea = document.getElementsByTagName("td");//попытка зафксировать действие мышки
    for (var i = 0; i < fireArea.length; i++) {
        fireArea[i].onclick = handlClickMouse
    }

    model.generateShipLocations();//запуск генерации кораблей

}
window.onload = init;

function handlClickMouse(eventObj) {//обработчик тыканья мышью
    var source = eventObj.target;
    var guess = source.id;
    var alphabet = ["a", "b", "c", "d", "e", "f", "g"];//массив для получения индекса по букве
    var firstChar = guess.charAt(0);//извлечение первого символа строки
    var row = alphabet[firstChar];//получение индекса (преобразование первого символа) через массив alphabet / отсчет индекса начинается с нуля
    var column = guess.charAt(1);
    var coordinate = row + column;
    messageArea.innerHTML = coordinate;
    /*     setTimeout(pause, 250);//пауза
        function pause() {
            controller.processGuess(coordinate);//передача координат в объект controller
        }
     */
    controller.processGuess(coordinate);
}



function handlKeyPress(e) {//функция для задействования кнопки огонь через ENTER
    var fireButton = document.getElementById("fireButton");
    if (e.keyCode === 13) {
        fireButton.click();
        return false;
    }
}

function handleFireButton() {//функция получения и передачии координат огня с помощью кнопки
    var guessInput = document.getElementById("guessInput");
    var guess = guessInput.value;
    controller.processGuess(guess);
    guessInput.value = "";
}

//доработать расположение кораблей
//закончил на стр. 427