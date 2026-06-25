/* ============================================================
   ThatMeme — 카테고리 정의 (categories.js)
   ------------------------------------------------------------
   기분(moods) / 용도(uses) 별 분류 규칙.
   각 카테고리:
     id   : 내부 식별자 (URL 슬러그로도 쓰임)
     en   : 영문 라벨,  ko : 한글 라벨,  emoji : 이모지
     seed : 대표 밈(name_en) — 항상 맨 앞에 우선 노출 (엄선)
     kw   : 자동 분류 키워드 — 밈의 이름/태그/설명에 포함되면 자동 합류
   밈을 추가하면 kw 매칭으로 자동 분류됩니다. 손볼 일은 거의 없어요.
   ============================================================ */
window.CATEGORIES = {
  moods: [
    { id:"angry", emoji:"😤", ko:"빡칠 때", en:"When you're angry",
      seed:["Woman Yelling at Cat","Arthur's Fist","Park Myung-soo 'Geoseong'","Where Banana (Minion)","Grumpy Cat","Michael Scott 'NO'"],
      kw:["화남","화난","버럭","호통","분노","빡쳐","빡칠","angry","rage","따지","yelling","주먹","발끈","짜증","소리지르"] },
    { id:"sad", emoji:"😢", ko:"슬플 때", en:"When you're sad",
      seed:["Sad Hamster","Crying Cat","Sad Pablo Escobar","Crying Jordan","Sad Keanu","Crying Wojak (Mask)"],
      kw:["슬픈","눈물","우는","외로","sad","crying","tears","쓸쓸","우울","슬픔","lonely","펑펑","풀 죽"] },
    { id:"happy", emoji:"🤩", ko:"신날 때", en:"When you're hyped",
      seed:["Gazua","Vince McMahon Reaction","Two Soyjaks Pointing","Sheesh","Leo Cheers","Happy Happy Cat / Banana Cat"],
      kw:["신난","행복","신나","happy","기쁨","가즈아","떡상","hype","sheesh","좋아 죽","흥"] },
    { id:"empty", emoji:"🫠", ko:"현타올 때", en:"When you feel empty",
      seed:["Primitive SpongeBob","NPC Wojak","Doomer","Sad Pablo Escobar","This Is Fine Dog","I Should Buy a Boat Cat"],
      kw:["허무","현타","무기력","멍한","넋나간","blank","공허","meh","넋","풀 죽"] },
    { id:"embarrassed", emoji:"😳", ko:"민망할 때", en:"When you're embarrassed",
      seed:["Meo-sseuk-tard","Awkward Monkey Puppet","Jeong Hyeong-don 'Awkward'","Hide the Pain Harold","Bad Luck Brian","Blinking Guy"],
      kw:["민망","어색","머쓱","awkward","쑥스","떨떠름","embarrass"] },
    { id:"dumbfounded", emoji:"😑", ko:"어이없을 때", en:"When you're dumbfounded",
      seed:["Blinking Guy","Yao Ming Face","How Absurd (Veteran)","Confused Nick Young","Jim Halpert Camera Look","Huh Cat"],
      kw:["어이없","어이가","황당","됐거든","빈정","disbelief","bitch please","끔뻑","헛웃음","뭐지"] },
    { id:"chill", emoji:"😪", ko:"귀찮을 때", en:"When you can't be bothered",
      seed:["Chill Guy","I Should Buy a Boat Cat","It's Free Real Estate","Loaf Cat","But It's Honest Work"],
      kw:["귀찮","느긋","chill","lazy","의욕","늘어","무심하게"] },
    { id:"love", emoji:"😍", ko:"설렐 때", en:"When you're smitten",
      seed:["Overly Attached Girlfriend","Ramen Before You Go? (Bom)","Distracted Boyfriend","Trade Offer","Drakeposting","Two Soyjaks Pointing"],
      kw:["사랑","설렘","설레","집착","love","두근","애정","하트","crush","연애","heart"] },
    { id:"nervous", emoji:"😰", ko:"긴장될 때", en:"When you're nervous",
      seed:["Nervous Tom","Two Buttons","Hold Up, Wait a Minute","Unsettled Tom","First Time? (James Franco)","Side-Eyeing Chloe"],
      kw:["불안","긴장","식은땀","nervous","sweat","초조","식은","덜덜","떨려","멈칫"] },
    { id:"flex", emoji:"😎", ko:"자랑하고플 때", en:"When you wanna flex",
      seed:["Gigachad","Stonks","Yes Chad","I'm Something of a Scientist Myself","Virgin vs Chad","Most Interesting Man"],
      kw:["자랑","우쭐","잘난","flex","차드","chad","상남자","gigachad","stonks","수익","우월","high ground"] },
    { id:"mock", emoji:"😏", ko:"비꼴 때", en:"When you're being snarky",
      seed:["Mocking SpongeBob","Condescending Wonka","Smug Pepe","Trollface","But That's None of My Business (Kermit)","Roll Safe"],
      kw:["비꼬","빈정","조롱","mocking","놀리","비웃","smug","능글"] },
    { id:"panic", emoji:"😵", ko:"멘붕왔을 때", en:"When you're losing it",
      seed:["Mr. Krabs Blur","This Is Fine Dog","Confused Math Lady","Eopu-eopu Frog","Stop It, Get Some Help","Surprised Pikachu"],
      kw:["멘붕","혼란","blur","어푸","정신없","panic","망함","불타는","어지러"] }
  ],
  uses: [
    { id:"groupchat", emoji:"💬", ko:"단톡방용", en:"For the group chat",
      seed:["Chimchakman","Joopearl (Joo Ho-min)","Crayon Shin-chan","Zanmang Loopy","Ryan (Kakao Friends)","Pengsoo","Huh Cat","Pop Cat"],
      kw:["짤","반응","reaction","표정","갸웃","huh","엥","pop","vibing","봉고","맥스웰","구피"] },
    { id:"decline", emoji:"🙅", ko:"거절할 때", en:"To say no",
      seed:["Yao Ming Face","Drakeposting","Nope, It Isn't","We Don't Do That Here","Grumpy Cat","Bonk (Horny Jail)"],
      kw:["거절","손사래","응 아니야","됐거든","bitch please","안돼","싫어","거부","선 긋"] },
    { id:"comeback", emoji:"🔥", ko:"받아칠 때", en:"For a comeback",
      seed:["Eojjeol-TV","Nope, It Isn't","OK Boomer","Cash Me Ousside","And I Took That Personally","Karen Wants the Manager"],
      kw:["받아치","어쩔","응 아니야","ok boomer","케런","발끈","comeback","받아쳐","단칼"] },
    { id:"monday", emoji:"🏢", ko:"월요일·출근", en:"Monday / work",
      seed:["Muhan Sangsa (Office Parody)","Jim Halpert Camera Look","Michael Scott 'NO'","Primitive SpongeBob","They're the Same Picture","This Is Fine Dog"],
      kw:["월요일","출근","직장","회사","부장","office","무한상사","monday","work","일하기 싫"] },
    { id:"friday", emoji:"🎉", ko:"퇴근·불금", en:"Friday / clocking out",
      seed:["Ight Imma Head Out","Chill Guy","Sheesh","Gangnam Style","Vince McMahon Reaction","Leo Cheers"],
      kw:["불금","퇴근","이만 가","head out","끝났다","금요일","홀가분","자유"] },
    { id:"deadline", emoji:"📚", ko:"마감·시험", en:"Deadline / exams",
      seed:["This Is Fine Dog","Mr. Krabs Blur","Waiting Skeleton","Confused Math Lady","Crying Wojak (Mask)","Hide the Pain Harold"],
      kw:["마감","시험","this is fine","불타는","벼락","deadline","stress","망함","멘붕"] },
    { id:"food", emoji:"🍜", ko:"먹을 때", en:"Food moments",
      seed:["Ramen Before You Go? (Bom)","Happy Happy Cat / Banana Cat","Hampter","Where Banana (Minion)","Loaf Cat","Is Mayonnaise an Instrument?"],
      kw:["라면","음식","food","바나나","banana","hampter","햄스터","식빵","다이어트","먹고","먹어"] },
    { id:"dating", emoji:"💘", ko:"연애·썸", en:"Dating / crushes",
      seed:["Overly Attached Girlfriend","Ramen Before You Go? (Bom)","Distracted Boyfriend","Drakeposting","Blinking Guy","Trade Offer"],
      kw:["연애","썸","짝사랑","고백","데이트","라면 먹고","집착","설레","dating"] },
    { id:"workout", emoji:"💪", ko:"운동할 때", en:"At the gym",
      seed:["Gigachad","Kim Kyeran (Physical Gallery)","Buff Doge vs Cheems","Epic Handshake","Average Enjoyer vs Average Fan","Yes Chad"],
      kw:["운동","헬스","근육","buff","gigachad","김계란","피지컬","chad","gym","상남자"] },
    { id:"praise", emoji:"👏", ko:"감탄·칭찬", en:"To hype someone up",
      seed:["Sheesh","Thumbs-Up Cat","Salt Bae","Damn Daniel","Two Soyjaks Pointing","Gigachad"],
      kw:["감탄","칭찬","멋져","대박","sheesh","따봉","엄지","thumbs","최고","wow","멋들어"] },
    { id:"giveup", emoji:"🏳️", ko:"포기할 때", en:"When you give up",
      seed:["Mr. Krabs Blur","Press F to Pay Respects","This Is Fine Dog","Sad Hamster","Coffin Dance","I Wanna Go Back (Peppermint Candy)"],
      kw:["포기","망함","혼란","blur","어푸","현타","press f","조의","자포자기","넋나간"] },
    { id:"celebrate", emoji:"🥂", ko:"축하할 때", en:"To celebrate",
      seed:["Leo Cheers","Success Kid","Vince McMahon Reaction","Sheesh","Gangnam Style","Muyaho"],
      kw:["축하","건배","cheers","환호","짝짝","파티","승리","성공","신난"] }
  ]
};
