/* Add a file to assets/runners or assets/cars, then add one entry here.
   Weights set each item's appearance chance within its pool. */
window.ROSTER = {
  runners: [
    { id:'runner', name:'Runner', file:'runner.gif', rarity:'Common', weight:50, scale:1.00 },
    { id:'speedster', name:'Speed Walker', file:'speed.gif', rarity:'Uncommon', weight:13, scale:1.04, aspect:1.21875 },
    { id:'business', name:'Business', file:'business.gif', rarity:'Rare', weight:5, scale:1.00 },
    { id:'duo', name:'Twins', file:'twins.gif', rarity:'Epic', weight:3, scale:1.10, aspect:1.65625 },
    { id:'skeleton', name:'Skeleton', file:'skeleton.gif', rarity:'Epic', weight:2, scale:1.05 },
    { id:'santa', name:'Santa', file:'santa.gif', rarity:'Legendary', weight:2.5, scale:1.08 },
    { id:'satan', name:'Satan', file:'satan.gif', rarity:'Mythic', weight:0.5, scale:1.05 },
    { id:'thief', name:'Thief', file:'thief.gif', rarity:'Uncommon', weight:12, scale:1.02 },
    { id:'bruh', name:'Bruh', file:'bruh.gif', rarity:'Rare', weight:5, scale:1.08, aspect:1.1875 },
    { id:'okayge', name:'Okayge', file:'okayge.gif', rarity:'Rare', weight:5, scale:1.00 },
    { id:'dinosaur', name:'Dinosaur', file:'dinosaur.gif', rarity:'Epic', weight:2, scale:1.05 }
  ],
  cars: [
    { id:'sedan', name:'Car', file:'car.png', rarity:'Common', weight:50, scale:1.00, aspect:2.8125, flip:true },
    { id:'catmobile', name:'Cat', file:'cat.png', rarity:'Rare', weight:5, scale:1.20, aspect:1.1875 },
    { id:'silly', name:'Silly', file:'silly.gif', rarity:'Epic', weight:7, scale:1.04, aspect:2.46875 },
    { id:'mcqueen', name:'McQueen', file:'mcqueen.png', rarity:'Rare', weight:5, scale:1.00, aspect:2.96875 },
    { id:'golf', name:'Golf', file:'golf.png', rarity:'Uncommon', weight:25, scale:1.00, aspect:2.09375, flip:true },
    { id:'glorp', name:'Glorp', file:'glorp.gif', rarity:'Legendary', weight:3, scale:1.25, aspect:1.00 },
    { id:'catbus', name:'Cat Bus', file:'catbus.gif', rarity:'Rare', weight:5, scale:1.15, aspect:1.00, flip:true }
  ]
};
