import * as PIXI from 'pixi.js';
import brain from 'brain.js';

let dataSet = [];

export class Game {
    APP;
    width;
    height;
    lineStorer = [];
    controller;
    network;
    tried = 1;
    loopIndex;
    trained = false;
    trainState = 'Now, AI plays randomly to collect data.';

    constructor(width, height) {

        this.network = new brain.NeuralNetwork();
        this.width = width;
        this.height = height;
        this.APP = startPIXI(width, height);
        this.controller = new Square();
        this.APP.stage.addChild(this.controller.graphics);
        console.clear();

        this.loopIndex = setInterval(() => {
            let line = new Line(this.width);
            this.lineStorer.push(line);
            this.APP.stage.addChild(line.graphics);

            line.loopIndex = setInterval(() => {
                line.graphics.position.y += 5;
                if (line.graphics.position.y >= 600) {
                    line.depose(line.loopIndex);
                } else if (Math.abs((this.controller.graphics.y - 99 - line.graphics.y)) < 5) {
                    if (this.controller.type !== line.type) {
                        dataSet.push({
                            input: {
                                cpntrollerType: this.controller.type,
                                lineType: line.type
                            },
                            output: {
                                fail: 1,
                                alive: 0
                            }
                        });
                        line.depose(line.loopIndex);
                        this.restart();
                    } else {
                        dataSet.push({
                            input: {
                                cpntrollerType: this.controller.type,
                                lineType: line.type
                            },
                            output: {
                                alive: 1,
                                fail: 0
                            }
                        });
                    }
                }
            }, 50);
        }, 1500);

        setInterval(() => {
            if (this.trained) {
                this.AIControl();
            } else {
                if (Math.random() > 0.9) {
                    this.controller.tap();
                }
            }
        }, 100);

    }

    AIControl = () => {
        let result = 0;
        let index = this.getClosestLine();
        if (index !== -1) {
            result = this.network.run({
                cpntrollerType: this.controller.type,
                lineType: this.lineStorer[index].type
            });
            console.log('alive percentage:' + result.alive + '\n fail percentage:' + result.fail);
            if (result.fail > result.alive) {
                this.controller.tap();
            }
        }
    }


    restart() {
        this.tried++;
        console.clear();
        this.controller.restart();
        this.lineStorer.map(val => {
            val.depose();
            return 0;
        });
        this.lineStorer = [];
        if (dataSet.length > 2) {
            this.network.train(dataSet);
            this.trained = true;
            this.trainState = 'Now AI makes decision through neural network.';
        }
    }
    suspend() {
        clearInterval(this.loopIndex);
    }

    getClosestLine() {
        let target = -1;
        this.lineStorer.map((val, index) => {
            if (val.deposed) {
                this.lineStorer.splice(index, 1);
            } else if (val.graphics.y < (this.controller.graphics.y - 99)) {
                if (target === -1) {
                    target = index;
                } else if (this.lineStorer[target].graphics.y < val.graphics.y) {
                    target = index;
                }
            }
            return 0;
        });
        return target;
    }

    restartTraning() {
        dataSet = [];
        this.tried = 0;
        this.trained = false;
        this.trainState = 'Now, AI plays randomly to collect data.';
        this.restart();
    }
}

class Line {
    width;
    height;
    loopIndex;
    graphics;
    type;
    id;
    deposed = false;

    constructor(width) {
        this.type = Math.floor(Math.random() * 4);
        this.graphics = new PIXI.Graphics();
        if (this.type === 0) {
            this.graphics.beginFill(0xFF0000, 1);
        } else if (this.type === 1) {
            this.graphics.beginFill(0x0000FF, 1);
        } else if (this.type === 2) {
            this.graphics.beginFill(0xFFFFFF, 1);
        } else {
            this.graphics.beginFill(0x00FF00, 1);
        }
        this.graphics.drawRect(0, 0, width, 10);
        this.graphics.endFill();
    }

    depose(clear) {
        if (!this.deposed) {
            clearInterval(this.loopIndex);
            clearInterval(clear);
            this.graphics.destroy();
            this.deposed = !this.deposed;
        }
    }

}

class Square {
    graphics;
    type = 0;

    constructor() {
        this.graphics = new PIXI.Graphics();
        this.graphics.beginFill(0xFF0000, 1);
        this.graphics.drawRect(0, 0, 70, 70);
        this.graphics.endFill();
        this.graphics.beginFill(0x00FF00, 1);
        this.graphics.drawRect(70, 0, 70, 70);
        this.graphics.endFill();
        this.graphics.beginFill(0x0000FF, 1);
        this.graphics.drawRect(0, 70, 70, 70);
        this.graphics.endFill();
        this.graphics.beginFill(0xFFFFFF, 1);
        this.graphics.drawRect(70, 70, 70, 70);
        this.graphics.endFill();
        this.graphics.pivot.set(70, 70);
        this.graphics.rotation = Math.PI / 4;
        this.graphics.position.set(250, 400);
        this.graphics.interactive = true;

        this.graphics.on('click', () => {
            this.type = (this.type + 1) % 4;
            this.graphics.rotation = (this.graphics.rotation + Math.PI / 2) % (2 * Math.PI);
        });
    }

    tap = () => {
        this.type = (this.type + 1) % 4;
        this.graphics.rotation = (this.graphics.rotation + Math.PI / 2) % (2 * Math.PI);
    }

    restart() {
        this.graphics.rotation = Math.PI / 4;
        this.type = 0;
    }

    depose() {
        this.graphics.destroy();
    }

}


function startPIXI(width, height) {
    let app = new PIXI.Application(width, height, {
        backgroundColor: 0x000000
    });
    document.getElementById('root').appendChild(app.view);
    return app;
}