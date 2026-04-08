/**
 * ScoutBolt Level Data
 * 10 progressively challenging levels
 */

const LevelData = {
    levels: [
        {
            id: 1,
            name: "First Bolt",
            plates: [
                {
                    x: 150, y: 200, width: 100, height: 100,
                    color: '#8b6f47',
                    bolts: [{ x: 200, y: 250 }]
                }
            ]
        },
        {
            id: 2,
            name: "Double Trouble",
            plates: [
                {
                    x: 100, y: 200, width: 200, height: 80,
                    color: '#8b6f47',
                    bolts: [{ x: 140, y: 240 }, { x: 260, y: 240 }]
                }
            ]
        },
        {
            id: 3,
            name: "Side by Side",
            plates: [
                {
                    x: 50, y: 150, width: 120, height: 80,
                    color: '#8b6f47',
                    bolts: [{ x: 90, y: 190 }, { x: 130, y: 190 }]
                },
                {
                    x: 230, y: 150, width: 120, height: 80,
                    color: '#6b5637',
                    bolts: [{ x: 270, y: 190 }, { x: 310, y: 190 }]
                }
            ]
        },
        {
            id: 4,
            name: "Stacked",
            plates: [
                {
                    x: 100, y: 300, width: 200, height: 60,
                    color: '#6b5637',
                    bolts: [{ x: 150, y: 330 }, { x: 250, y: 330 }],
                    supports: [1]
                },
                {
                    x: 100, y: 220, width: 200, height: 60,
                    color: '#8b6f47',
                    bolts: [{ x: 150, y: 250 }, { x: 250, y: 250 }]
                }
            ]
        },
        {
            id: 5,
            name: "Cross",
            plates: [
                {
                    x: 150, y: 100, width: 100, height: 200,
                    color: '#8b6f47',
                    bolts: [{ x: 200, y: 150 }, { x: 200, y: 250 }]
                },
                {
                    x: 100, y: 180, width: 200, height: 60,
                    color: '#6b5637',
                    bolts: [{ x: 140, y: 210 }, { x: 260, y: 210 }]
                }
            ]
        },
        {
            id: 6,
            name: "Locked",
            plates: [
                {
                    x: 80, y: 200, width: 240, height: 80,
                    color: '#8b6f47',
                    bolts: [
                        { x: 120, y: 240, locked: true, unlocksAfter: 1 },
                        { x: 200, y: 240 },
                        { x: 280, y: 240, locked: true, unlocksAfter: 1 }
                    ]
                }
            ]
        },
        {
            id: 7,
            name: "Chain Reaction",
            plates: [
                {
                    x: 50, y: 350, width: 300, height: 50,
                    color: '#5c4033',
                    bolts: [{ x: 100, y: 375 }, { x: 200, y: 375 }, { x: 300, y: 375 }],
                    supports: [1, 2]
                },
                {
                    x: 80, y: 280, width: 100, height: 50,
                    color: '#6b5637',
                    bolts: [{ x: 110, y: 305 }, { x: 150, y: 305 }]
                },
                {
                    x: 220, y: 280, width: 100, height: 50,
                    color: '#6b5637',
                    bolts: [{ x: 250, y: 305 }, { x: 290, y: 305 }]
                },
                {
                    x: 130, y: 200, width: 140, height: 60,
                    color: '#8b6f47',
                    bolts: [{ x: 170, y: 230 }, { x: 230, y: 230 }]
                }
            ]
        },
        {
            id: 8,
            name: "Complex",
            plates: [
                {
                    x: 100, y: 320, width: 200, height: 60,
                    color: '#5c4033',
                    bolts: [{ x: 140, y: 350 }, { x: 260, y: 350 }],
                    supports: [1, 2]
                },
                {
                    x: 50, y: 240, width: 120, height: 60,
                    color: '#6b5637',
                    bolts: [{ x: 90, y: 270 }, { x: 130, y: 270 }],
                    supports: [3]
                },
                {
                    x: 230, y: 240, width: 120, height: 60,
                    color: '#6b5637',
                    bolts: [{ x: 270, y: 270 }, { x: 310, y: 270 }],
                    supports: [3]
                },
                {
                    x: 140, y: 160, width: 120, height: 60,
                    color: '#8b6f47',
                    bolts: [{ x: 180, y: 190 }, { x: 220, y: 190 }]
                }
            ]
        },
        {
            id: 9,
            name: "Pyramid",
            plates: [
                {
                    x: 100, y: 380, width: 200, height: 50,
                    color: '#5c4033',
                    bolts: [{ x: 140, y: 405 }, { x: 200, y: 405 }, { x: 260, y: 405 }],
                    supports: [1, 2]
                },
                {
                    x: 80, y: 310, width: 100, height: 50,
                    color: '#6b5637',
                    bolts: [{ x: 110, y: 335 }, { x: 150, y: 335 }],
                    supports: [3]
                },
                {
                    x: 220, y: 310, width: 100, height: 50,
                    color: '#6b5637',
                    bolts: [{ x: 250, y: 335 }, { x: 290, y: 335 }],
                    supports: [3]
                },
                {
                    x: 130, y: 240, width: 140, height: 50,
                    color: '#7a5e3e',
                    bolts: [{ x: 170, y: 265 }, { x: 230, y: 265 }],
                    supports: [4]
                },
                {
                    x: 160, y: 170, width: 80, height: 50,
                    color: '#8b6f47',
                    bolts: [{ x: 190, y: 195 }, { x: 210, y: 195 }]
                }
            ]
        },
        {
            id: 10,
            name: "Master",
            plates: [
                {
                    x: 50, y: 400, width: 300, height: 50,
                    color: '#4a3728',
                    bolts: [
                        { x: 100, y: 425, locked: true, unlocksAfter: 2 },
                        { x: 200, y: 425 },
                        { x: 300, y: 425, locked: true, unlocksAfter: 2 }
                    ],
                    supports: [1, 2, 3]
                },
                {
                    x: 40, y: 330, width: 90, height: 50,
                    color: '#5c4033',
                    bolts: [{ x: 70, y: 355 }, { x: 100, y: 355 }],
                    supports: [4]
                },
                {
                    x: 155, y: 330, width: 90, height: 50,
                    color: '#5c4033',
                    bolts: [{ x: 185, y: 355 }, { x: 215, y: 355 }],
                    supports: [4]
                },
                {
                    x: 270, y: 330, width: 90, height: 50,
                    color: '#5c4033',
                    bolts: [{ x: 300, y: 355 }, { x: 330, y: 355 }],
                    supports: [4]
                },
                {
                    x: 100, y: 260, width: 200, height: 50,
                    color: '#6b5637',
                    bolts: [{ x: 140, y: 285 }, { x: 200, y: 285 }, { x: 260, y: 285 }],
                    supports: [5]
                },
                {
                    x: 140, y: 190, width: 120, height: 50,
                    color: '#8b6f47',
                    bolts: [{ x: 180, y: 215 }, { x: 220, y: 215 }]
                }
            ]
        }
    ],

    getLevel(id) {
        return this.levels.find(l => l.id === id) || null;
    },

    getTotalLevels() {
        return this.levels.length;
    },

    hasLevel(id) {
        return id >= 1 && id <= this.levels.length;
    },

    getNextLevel(currentId) {
        const next = currentId + 1;
        return this.hasLevel(next) ? next : null;
    }
};
