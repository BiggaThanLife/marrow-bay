"use strict";
/* Inner voices: when an arc hook is offered, a voice from your background can speak up and start you off with an edge. */
ARCS.dockstrike.hook.voices={
 'working-class':{label:'Working-class: "I know a picket line when I see one."',text:'Your instincts hit like a whistle. The dockers already half trust you.',fx:A=>{arcPower(4);facAdd('union',3)}},
 educated:{label:'Educated: "Read the contract. Then read the footnotes."',text:'You spot the clause that makes the camera timing technically legal. Gus pretends not to be impressed.',fx:A=>{arcPower(3);G.flags.sawFlack7=G.flags.sawFlack7||0}},
 smooth:{label:'Smooth: "Let me talk to both sides first."',text:'Two tables, two stories, one very good listener.',fx:A=>{facAdd('shipping',3);facAdd('union',3)}}};
ARCS.bubble.hook.voices={
 educated:{label:'Educated: "Show me the leverage ratios."',text:'Cordelia stops talking mid-sentence, then slides you a single page. It is the right page.',fx:A=>{A.tip=true}},
 'working-class':{label:'Working-class: "Who pays when it falls?"',text:'Nobody in the room answers fast enough. You make a note of that.',fx:A=>{A.warn=1}},
 smooth:{label:'Smooth: "I would love to be in the room where it is decided."',text:'Cordelia\u2019s smile is professional and very slightly nervous.',fx:A=>{memAdd('cordelia',4);A.fund=1}}};
ARCS.turfwar.hook.voices={
 'light-fingered':{label:'Light fingers: "I could lift their ledger."',text:'Your hands are already warm. Vex notices. He says nothing and approves of the silence.',fx:A=>{A.stance='vex';facAdd('crew',4);A.power=Math.min(100,A.power+6)}},
 smooth:{label:'Smooth: "I do not need to pick a side yet."',text:'Both crews hear you say it and both assume you mean theirs.',fx:A=>{facAdd('crew',2);facAdd('salt',2)}},
 'working-class':{label:'Working-class: "Neither of them lives where I live."',text:'You will remember that sentence the next time a window breaks.',fx:A=>{facAdd('hall',2)}}};
ARCS.foundry.hook.voices={
 'working-class':{label:'Working-class: "I have seen that gauge lie before."',text:'Ines blinks. Then she nods, once, like she has been waiting for someone to say it.',fx:A=>{A.expose=1}},
 educated:{label:'Educated: "Show me the inspection schedule."',text:'The schedule has gaps in all the right places.',fx:A=>{A.expose=1}},
 strong:{label:'Strong: "I can carry what the others will not."',text:'The night shift decides they like you.',fx:A=>{facAdd('union',3)}}};
ARCS.buyout.hook.voices={
 rural:{label:'Rural: "A field remembers who plowed it."',text:'Wren straightens up, a quarter inch, which for Wren is a standing ovation.',fx:A=>{A.save=1;facAdd('coop',3)}},
 educated:{label:'Educated: "Who actually owns the company that owns the company?"',text:'A paper trail begins to appear, one cousin at a time.',fx:A=>{A.sab=1}},
 smooth:{label:'Smooth: "Everybody wants something. Let us find out what."',text:'Marlowe Land\u2019s agent starts to talk. You nod. You are listening for the number.',fx:A=>{A.sale=1;A.save=1}}};
