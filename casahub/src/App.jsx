import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";

// ─── Firestore sync ───────────────────────────────────────────────────────────
const DOC_REF = doc(db, "casahub", "data");

const saveToFirestore = async (data) => {
  try { await setDoc(DOC_REF, data); } catch(e) { console.error(e); }
};

// ─── Date utils ───────────────────────────────────────────────────────────────
const today = new Date();
const fmt = (d) => d.toISOString().split("T")[0];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const DAYS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

// ─── RECIPE DATABASE ──────────────────────────────────────────────────────────
const RECIPES = [
  { id:"r01", nombre:"Bruschettas mediterráneas de tomate y aceitunas", categoria:"Entrada", calorias:165, porciones:4, ingredientes:["Pan integral (8 rodajas)","Tomates perita (3)","Aceitunas negras (¼ taza)","Aceite de oliva","Ajo (1 diente)","Albahaca fresca","Sal y pimienta"], preparacion:["Mezclar tomates picados, aceitunas, ajo, aceite de oliva, sal y pimienta.","Dejar reposar 5 minutos para integrar sabores.","Colocar sobre las tostadas y terminar con hojas de albahaca fresca."] },
  { id:"r02", nombre:"Hummus clásico con pimentón y oliva", categoria:"Entrada", calorias:140, porciones:4, ingredientes:["Garbanzos cocidos (1 taza)","Tahini (2 cdas)","Limón (1)","Ajo (1 diente)","Aceite de oliva","Pimentón dulce","Sal"], preparacion:["Procesar garbanzos, tahini, limón, ajo y aceite de oliva durante 1 minuto hasta lograr crema.","Ajustar textura con 1–2 cucharadas de agua si fuera necesario.","Servir con pimentón y un hilo de aceite de oliva."] },
  { id:"r03", nombre:"Pinchos mediterráneos con vegetales grillados y queso magro", categoria:"Entrada", calorias:110, porciones:4, ingredientes:["Zucchini (1)","Berenjena (1)","Pimiento rojo (1)","Queso magro (150g)","Aceite de oliva","Sal y pimienta"], preparacion:["Mezclar los vegetales cortados con aceite de oliva, sal y pimienta.","Grillar o dorar en sartén 5–7 minutos hasta tiernos.","Armar los pinchos alternando vegetales y cubos de queso magro."] },
  { id:"r04", nombre:"Tartar de atún con pepino, lima y oliva", categoria:"Entrada", calorias:155, porciones:4, ingredientes:["Atún fresco (300g)","Pepino (½)","Lima (1)","Aceite de oliva","Perejil o cilantro","Sal y pimienta"], preparacion:["Mezclar el atún picado con el pepino, el jugo de lima y el aceite de oliva.","Salpimentar y agregar perejil o cilantro picado.","Refrigerar 10 minutos antes de servir."] },
  { id:"r05", nombre:"Dip de yogur con limón, ajo y hierbas (tzatziki)", categoria:"Entrada", calorias:70, porciones:4, ingredientes:["Yogur natural espeso (1 taza)","Pepino (½, rallado)","Ajo (1 diente)","Limón (½)","Eneldo o menta","Sal"], preparacion:["Mezclar el yogur con el pepino bien escurrido.","Agregar el jugo de limón, el ajo picado y las hierbas.","Refrigerar 20 minutos para que tome sabor antes de servir."] },
  { id:"r06", nombre:"Ensalada tibia de porotos blancos con tomate y perejil", categoria:"Entrada", calorias:155, porciones:4, ingredientes:["Porotos blancos cocidos (1 taza)","Tomates (2)","Cebolla morada (¼, opcional)","Aceite de oliva","Limón","Perejil fresco","Sal y pimienta"], preparacion:["Calentar ligeramente los porotos en sartén 2–3 minutos.","Mezclar con tomate picado, jugo de limón, aceite de oliva y perejil.","Salpimentar y servir tibia o a temperatura ambiente."] },
  { id:"r07", nombre:"Caprese mediterránea con queso magro y oliva", categoria:"Entrada", calorias:120, porciones:4, ingredientes:["Tomates redondos (2)","Queso magro (200g)","Albahaca fresca","Aceite de oliva","Sal y pimienta"], preparacion:["Alternar rodajas de tomate y queso magro en un plato.","Agregar hojas de albahaca, aceite de oliva, sal y pimienta.","Servir inmediatamente."] },
  { id:"r08", nombre:"Merluza con tomates, alcaparras y oliva", categoria:"Principal", calorias:210, porciones:4, ingredientes:["Filetes de merluza (4)","Tomates (2)","Alcaparras (1 cda)","Aceite de oliva","Limón (½)","Perejil"], preparacion:["Colocar la merluza en una fuente. Cubrir con tomates picados y alcaparras.","Rociar con jugo de limón y aceite de oliva.","Hornear a 180°C durante 12–15 minutos, hasta que el pescado se desarme fácilmente.","Terminar con perejil fresco picado."] },
  { id:"r09", nombre:"Salmón al horno con hierbas, tomates cherry y aceitunas", categoria:"Principal", calorias:320, porciones:4, ingredientes:["Filetes de salmón (4)","Tomates cherry (1 taza)","Aceitunas negras (¼ taza)","Aceite de oliva","Romero y tomillo"], preparacion:["Colocar el salmón en una placa y sumar los tomates cherry y las aceitunas.","Aromatizar con romero, tomillo y un hilo de aceite de oliva.","Hornear a 180°C durante 15 minutos o hasta que esté firme y tierno."] },
  { id:"r10", nombre:"Paella mediterránea con verduras y mariscos", categoria:"Principal", calorias:285, porciones:4, ingredientes:["Arroz (1 taza)","Mix de mariscos (300g)","Pimiento rojo (1)","Zucchini (1)","Tomate (1)","Azafrán o cúrcuma","Aceite de oliva","Caldo"], preparacion:["Saltear los vegetales picados en aceite de oliva durante 5 minutos.","Agregar el arroz, mezclar 1 minuto y sumar el caldo caliente y las especias.","Cocinar a fuego medio 15 minutos sin tapar.","Agregar los mariscos y continuar 5–7 minutos hasta que absorba el líquido.","Reposar 5 minutos antes de servir."] },
  { id:"r11", nombre:"Bowl mediterráneo con quinoa, garbanzos y atún", categoria:"Principal", calorias:340, porciones:4, ingredientes:["Quinoa (1 taza)","Garbanzos cocidos (1 taza)","Atún en lata (2 latas)","Vegetales asados","Aceite de oliva","Limón"], preparacion:["Cocinar la quinoa: 1 taza en 2 tazas de agua hirviendo por 12–15 minutos.","Desmenuzar el atún y asar los vegetales con aceite de oliva.","Armar los bowls con quinoa, garbanzos y vegetales.","Terminar con aceite de oliva, limón, sal y pimienta."] },
  { id:"r12", nombre:"Cazuela de langostinos con ajo, tomate y pimentón", categoria:"Principal", calorias:215, porciones:4, ingredientes:["Langostinos (300g)","Tomates (2)","Ajo (2 dientes)","Pimentón (1 cdita)","Aceite de oliva"], preparacion:["Saltear el ajo en aceite de oliva durante 1 minuto.","Agregar los tomates picados y cocinar 3 minutos.","Incorporar los langostinos y el pimentón. Cocinar 5 minutos hasta que estén rosados."] },
  { id:"r13", nombre:"Cazuela de garbanzos con espinaca y pimentón", categoria:"Principal", calorias:260, porciones:4, ingredientes:["Garbanzos cocidos (1 taza)","Espinaca (2 tazas)","Tomate (1)","Pimentón (1 cdita)","Aceite de oliva"], preparacion:["Saltear el tomate picado y los garbanzos en aceite de oliva durante 3 minutos.","Agregar la espinaca y el pimentón.","Cocinar 3–4 minutos hasta integrar todos los sabores."] },
  { id:"r14", nombre:"Berenjenas rellenas con tomate, queso magro y hierbas", categoria:"Principal", calorias:185, porciones:4, ingredientes:["Berenjenas (2)","Tomate picado (1 taza)","Queso magro rallado (150g)","Aceite de oliva"], preparacion:["Cortar las berenjenas al medio, ahuecar y picar la pulpa.","Saltear la pulpa con el tomate picado durante 5 minutos.","Rellenar las mitades, agregar queso magro rallado y hornear a 180°C por 20 minutos.","Gratinar 3 minutos al final hasta dorar."] },
  { id:"r15", nombre:"Wok mediterráneo de verduras salteadas", categoria:"Principal", calorias:140, porciones:4, ingredientes:["Cebolla (1)","Pimiento (1)","Zucchini (1)","Berenjena (1)","Tomate (1)","Aceite de oliva"], preparacion:["Saltear la cebolla y el pimiento en aceite de oliva durante 5 minutos.","Agregar el zucchini y la berenjena y cocinar 8 minutos más.","Incorporar el tomate y cocinar 5 minutos finales hasta integrar."] },
  { id:"r16", nombre:"Guiso de lentejas con verduras y oliva", categoria:"Principal", calorias:150, porciones:4, ingredientes:["Lentejas (1 taza)","Cebolla (1)","Zanahoria (1)","Tomate (1)","Aceite de oliva"], preparacion:["Cocinar las lentejas en 3 tazas de agua durante 25–30 minutos.","Saltear la cebolla, zanahoria y tomate en aceite de oliva durante 5 minutos.","Mezclar con las lentejas cocidas y cocinar 5 minutos más."] },
  { id:"r17", nombre:"Pollo al limón con hierbas y vegetales asados", categoria:"Principal", calorias:280, porciones:4, ingredientes:["Pechugas de pollo (4)","Limón (1)","Mix de vegetales","Aceite de oliva","Sal y pimienta"], preparacion:["Marinar el pollo con jugo de limón, sal y pimienta durante 15 minutos.","Asar los vegetales con aceite de oliva a 200°C durante 20–25 minutos.","Cocinar el pollo a la plancha 6–7 minutos por lado hasta dorar."] },
  { id:"r18", nombre:"Pasta integral con vegetales asados y almendras", categoria:"Principal", calorias:330, porciones:4, ingredientes:["Pasta integral (300g)","Zucchini (1)","Berenjena (1)","Pimiento rojo (1)","Aceite de oliva","Almendras picadas (2 cdas)","Orégano"], preparacion:["Cocinar la pasta en agua hirviendo con sal durante 8–10 minutos.","Cortar los vegetales, mezclar con aceite de oliva, sal y pimienta. Asar a 200°C por 20 minutos.","Mezclar la pasta cocida con los vegetales asados, agregar aceite de oliva y orégano.","Servir con almendras picadas por encima."] },
  { id:"r19", nombre:"Cous cous con garbanzos, verduras y limón", categoria:"Principal", calorias:320, porciones:4, ingredientes:["Cous cous integral (1 taza)","Garbanzos cocidos (1 taza)","Zucchini (1)","Tomate (1)","Pimiento amarillo (1)","Aceite de oliva","Limón (1)","Perejil"], preparacion:["Hidratar el cous cous: cubrir con 1 taza de agua hirviendo, tapar y dejar 5 minutos. Soltar con tenedor.","Saltear el zucchini y el pimiento en aceite de oliva durante 5–7 minutos.","Mezclar cous cous, garbanzos, vegetales salteados y tomate fresco.","Condimentar con limón, aceite de oliva, perejil, sal y pimienta."] },
  { id:"r20", nombre:"Arroz integral con verduras y frutos secos", categoria:"Principal", calorias:310, porciones:4, ingredientes:["Arroz integral (1 taza)","Zanahoria (1)","Zucchini (1)","Frutos secos (puñado)","Aceite de oliva","Perejil","Sal y pimienta"], preparacion:["Cocinar el arroz integral en 2½ tazas de agua con sal durante 35–40 minutos.","Saltear la zanahoria y el zucchini en aceite de oliva durante 8 minutos.","Mezclar el arroz cocido con los vegetales salteados.","Agregar frutos secos picados, perejil y un hilo de aceite de oliva."] },
  { id:"r21", nombre:"Peras al vino tinto con canela y cítricos", categoria:"Postre", calorias:165, porciones:4, ingredientes:["Peras (4)","Vino tinto (1 taza)","Cáscara de naranja","Canela (1 rama)"], preparacion:["Colocar las peras, el vino, la canela y la cáscara de naranja en una olla pequeña.","Cocinar a fuego bajo 20–25 minutos, girándolas a mitad de cocción.","Retirar del fuego y dejar reposar 5 minutos antes de servir."] },
  { id:"r22", nombre:"Yogur natural con frutas de estación y frutos secos", categoria:"Postre", calorias:180, porciones:4, ingredientes:["Yogur natural (2 tazas)","Frutas de estación (1 taza)","Frutos secos picados (¼ taza)","Miel (opcional)"], preparacion:["Colocar el yogur en bowls o vasitos individuales.","Agregar las frutas de estación y los frutos secos picados.","Terminar con un hilo de miel si se desea. Servir inmediatamente."] },
  { id:"r23", nombre:"Budín húmedo de naranja y almendras", categoria:"Postre", calorias:210, porciones:8, ingredientes:["Huevos (2)","Harina integral (1 taza)","Almendras molidas (¼ taza)","Jugo de naranja (½ taza)","Aceite (2 cdas)","Miel (2 cdas)"], preparacion:["Mezclar los huevos, el jugo de naranja, el aceite, la miel y ralladura de naranja.","Agregar la harina integral y las almendras molidas. Integrar sin batir de más.","Volcar en molde enmantecado y hornear a 180°C por 35–40 minutos.","Enfriar completamente antes de cortar."] },
  { id:"r24", nombre:"Manzanas asadas con nueces y canela", categoria:"Postre", calorias:185, porciones:4, ingredientes:["Manzanas (4)","Nueces picadas (2 cdas)","Canela","Miel (1 cdita)"], preparacion:["Ahuecar las manzanas con una cuchara o descorazonador.","Rellenar con nueces picadas y un toque de miel.","Espolvorear canela por encima.","Hornear a 180°C durante 20–25 minutos hasta que estén tiernas."] },
  { id:"r25", nombre:"Mousse de frutillas con ricota descremada", categoria:"Postre", calorias:130, porciones:4, ingredientes:["Frutillas (2 tazas)","Ricota descremada (1 taza)","Miel (1 cda)"], preparacion:["Procesar las frutillas, la ricota descremada y la miel durante 1–2 minutos hasta obtener textura cremosa.","Refrigerar al menos 30 minutos antes de servir."] },
  { id:"r26", nombre:"Compota de durazno o manzana con pistachos", categoria:"Postre", calorias:160, porciones:4, ingredientes:["Duraznos o manzanas (4)","Agua (½ taza)","Canela","Cáscara de naranja o limón","Pistachos picados (2 cdas)","Miel (opcional)"], preparacion:["Colocar la fruta pelada y en cubos en una olla con el agua, la canela y la cáscara de cítrico.","Cocinar a fuego bajo hasta que la fruta esté tierna y se forme una compota suave.","Agregar la miel al final si se desea y mezclar.","Servir en compoteras individuales con los pistachos picados por encima."] },
  { id:"r27", nombre:"Dátiles rellenos con nueces y chocolate amargo", categoria:"Postre", calorias:135, porciones:4, ingredientes:["Dátiles sin carozo (12-16)","Nueces picadas (¼ taza)","Chocolate amargo 70% (40g)"], preparacion:["Rellenar cada dátil con un poco de nueces picadas.","Derretir el chocolate a baño María o en microondas a baja potencia.","Bañar parcialmente los dátiles en el chocolate derretido o hacer hilos por encima.","Llevar a una placa con papel manteca y enfriar en heladera hasta que el chocolate solidifique."] },
];
const RECIPE_MAP = Object.fromEntries(RECIPES.map(r=>[r.id,r]));

// ─── Default data ─────────────────────────────────────────────────────────────
const defaultData = () => {
  const menu = {};
  for (let i = 0; i < 30; i++) {
    const d = fmt(addDays(today, i));
    menu[d] = { almuerzo:"", almuerzoId:null, almuerzoIngredientes:[], almuerzoVerificado:false, cena:"", cenaId:null, cenaIngredientes:[], cenaVerificado:false };
  }
  return {
    events: {}, menu,
    shopping: [
      { id:"s1", item:"Tomates", qty:"1kg", done:false, category:"Verduras" },
      { id:"s2", item:"Leche", qty:"2L", done:false, category:"Lácteos" },
    ],
    tasks: [
      { id:"t1", text:"Limpiar baño", done:false, priority:"alta", date:fmt(today) },
      { id:"t2", text:"Preparar almuerzo de Lolo", done:false, priority:"alta", date:fmt(today) },
    ],
    lolo: { desayuno:"Leche con cereal + fruta", actividades:[
      { id:"a1", hora:"09:00", actividad:"Desayuno", done:false },
      { id:"a2", hora:"10:00", actividad:"Juego libre", done:false },
      { id:"a3", hora:"12:30", actividad:"Almuerzo", done:false },
      { id:"a4", hora:"14:00", actividad:"Siesta", done:false },
      { id:"a5", hora:"16:00", actividad:"Merienda", done:false },
    ], notas:"" },
    activeModules: ["calendar","menu","shopping","tasks","lolo"],
    budget: { items:[], monthlyLimit:0 },
    suppliers: [],
    reminders: [],
  };
};

// ─── Icon ─────────────────────────────────────────────────────────────────────
const Icon = ({ name, size=18, color="currentColor" }) => {
  const p = {
    calendar:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    cart:"M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    tasks:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    check:"M5 13l4 4L19 7", plus:"M12 4v16m8-8H4", x:"M6 18L18 6M6 6l12 12",
    trash:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    chef:"M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    baby:"M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    user:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    edit:"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    money:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    truck:"M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0",
    alarm:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    grid:"M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    chevronLeft:"M15 19l-7-7 7-7", chevronRight:"M9 5l7 7-7 7",
    shoppingBag:"M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
    search:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    warn:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    sync:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={p[name]||""}/></svg>;
};

const Badge = ({ children, color="blue" }) => {
  const map = { blue:"#dbeafe,#1d4ed8", green:"#dcfce7,#15803d", orange:"#fed7aa,#c2410c", red:"#fee2e2,#b91c1c", purple:"#ede9fe,#6d28d9", gray:"#f3f4f6,#374151", yellow:"#fef9c3,#a16207" };
  const [bg,fg] = (map[color]||map.gray).split(",");
  return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:12,fontSize:11,fontWeight:600,background:bg,color:fg}}>{children}</span>;
};

// ─── MODULE CATALOG ───────────────────────────────────────────────────────────
const MODULE_CATALOG = [
  { id:"calendar", label:"Agenda",   icon:"calendar", core:true,  desc:"Calendario ampliable, eventos por hora" },
  { id:"menu",     label:"Menú",     icon:"chef",     core:true,  desc:"Menú semanal con recetario mediterráneo" },
  { id:"shopping", label:"Compras",  icon:"cart",     core:true,  desc:"Lista de compras por categoría" },
  { id:"tasks",    label:"Tareas",   icon:"tasks",    core:true,  desc:"Tareas con prioridad y fecha" },
  { id:"lolo",     label:"Lolo",     icon:"baby",     core:true,  desc:"Rutina, desayuno y actividades de Lolo" },
  { id:"reminders",label:"Alertas",  icon:"alarm",    core:false, desc:"Recordatorios recurrentes con hora" },
  { id:"budget",   label:"Presupuesto",icon:"money",  core:false, desc:"Control de gastos del hogar" },
  { id:"suppliers",label:"Proveedores",icon:"truck",  core:false, desc:"Contactos: verdulero, carnicero, etc." },
];

// ─── MODULE MANAGER ───────────────────────────────────────────────────────────
const ModuleManager = ({ data, setData, onClose }) => {
  const toggle = (id) => {
    const mod = MODULE_CATALOG.find(m=>m.id===id);
    if (mod.core) return;
    setData(d => { const has=d.activeModules.includes(id); return {...d, activeModules: has?d.activeModules.filter(m=>m!==id):[...d.activeModules,id]}; });
  };
  return (
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.4)"}}/>
      <div style={{position:"relative",background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:680,padding:"20px 20px 36px",boxShadow:"0 -4px 32px rgba(0,0,0,.15)"}}>
        <div style={{width:40,height:4,background:"#e2e8f0",borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div><div style={{fontSize:17,fontWeight:800,color:"#1e293b"}}>Módulos</div><div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>Activá o desactivá secciones</div></div>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",borderRadius:8,padding:8,cursor:"pointer"}}><Icon name="x" size={16} color="#64748b"/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {MODULE_CATALOG.map(mod=>{
            const active=data.activeModules.includes(mod.id);
            return (
              <div key={mod.id} onClick={()=>toggle(mod.id)} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",background:active?"#faf5ff":"#f8fafc",border:active?"1.5px solid #a78bfa":"1.5px solid #e2e8f0",borderRadius:14,cursor:mod.core?"default":"pointer"}}>
                <div style={{width:38,height:38,borderRadius:10,background:active?"#7c3aed":"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name={mod.icon} size={18} color={active?"#fff":"#94a3b8"}/></div>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{mod.label}</div><div style={{fontSize:12,color:"#94a3b8"}}>{mod.desc}</div></div>
                {mod.core?<span style={{fontSize:10,color:"#a78bfa",fontWeight:600,background:"#ede9fe",padding:"2px 7px",borderRadius:8}}>Fijo</span>
                :<div style={{width:42,height:24,borderRadius:12,background:active?"#7c3aed":"#cbd5e1",position:"relative"}}><div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:active?21:3,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── RECIPE PICKER ────────────────────────────────────────────────────────────
const RecipePicker = ({ value, onChange, onClose }) => {
  const [search,setSearch]=useState(""); const [cat,setCat]=useState("Todos"); const [preview,setPreview]=useState(null);
  const cats=["Todos","Entrada","Principal","Postre"];
  const filtered=RECIPES.filter(r=>(cat==="Todos"||r.categoria===cat)&&r.nombre.toLowerCase().includes(search.toLowerCase()));
  if (preview) {
    const catColor=preview.categoria==="Entrada"?"#dbeafe":preview.categoria==="Principal"?"#dcfce7":"#fce7f3";
    const catEmoji=preview.categoria==="Entrada"?"🥗":preview.categoria==="Principal"?"🍽":"🍮";
    return (
      <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div onClick={()=>setPreview(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)"}}/>
        <div style={{position:"relative",background:"#fff",borderRadius:20,width:"100%",maxWidth:500,maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
          <div style={{background:catColor,padding:"16px 16px 14px"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{fontSize:28}}>{catEmoji}</div>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:"#1e293b",lineHeight:1.3}}>{preview.nombre}</div><div style={{fontSize:12,color:"#64748b",marginTop:3}}>{preview.categoria} · {preview.calorias} kcal</div></div>
            </div>
          </div>
          <div style={{overflowY:"auto",flex:1,padding:"14px 16px"}}>
            <div style={{fontSize:12,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Ingredientes</div>
            <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:20}}>
              {preview.ingredientes.map((ing,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#1e293b"}}><div style={{width:6,height:6,borderRadius:"50%",background:"#6366f1",flexShrink:0}}/>{ing}</div>)}
            </div>
            {preview.preparacion&&<>
              <div style={{fontSize:12,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Preparación</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {preview.preparacion.map((paso,i)=>(
                  <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:"#6366f1",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0,marginTop:1}}>{i+1}</div>
                    <p style={{margin:0,fontSize:13,color:"#334155",lineHeight:1.5}}>{paso}</p>
                  </div>
                ))}
              </div>
              {preview.porciones&&<div style={{marginTop:16,padding:"8px 12px",background:"#f8fafc",borderRadius:10,fontSize:12,color:"#64748b"}}>🍽 Rinde {preview.porciones} porciones · {preview.calorias} kcal c/u</div>}
            </>}
          </div>
          <div style={{padding:"12px 16px",borderTop:"1px solid #f1f5f9",display:"flex",gap:8}}>
            <button onClick={()=>setPreview(null)} style={{flex:1,padding:"10px",background:"#f1f5f9",color:"#64748b",border:"none",borderRadius:10,cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>← Volver</button>
            <button onClick={()=>{onChange(preview.id,preview.nombre);onClose();}} style={{flex:2,padding:"10px",background:"#6366f1",color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontFamily:"inherit",fontSize:14}}>Elegir esta receta</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)"}}/>
      <div style={{position:"relative",background:"#fff",borderRadius:20,width:"100%",maxWidth:500,maxHeight:"80vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{padding:"16px 16px 12px",borderBottom:"1px solid #f1f5f9"}}>
          <div style={{fontSize:16,fontWeight:800,color:"#1e293b",marginBottom:10}}>🍽 Elegir receta</div>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
            <Icon name="search" size={16} color="#94a3b8"/>
            <input autoFocus placeholder="Buscar receta..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,border:"none",background:"transparent",fontSize:14,fontFamily:"inherit",outline:"none",color:"#1e293b"}}/>
          </div>
          <div style={{display:"flex",gap:6}}>{cats.map(c=><button key={c} onClick={()=>setCat(c)} style={{padding:"4px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",background:cat===c?"#6366f1":"#f1f5f9",color:cat===c?"#fff":"#64748b"}}>{c}</button>)}</div>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"8px 12px 16px"}}>
          <div onClick={()=>{onChange(null,"");onClose();}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,cursor:"pointer",marginBottom:4,background:"#f8fafc",border:"1px dashed #cbd5e1"}} onMouseEnter={e=>e.currentTarget.style.background="#ede9fe"} onMouseLeave={e=>e.currentTarget.style.background="#f8fafc"}>
            <div style={{width:36,height:36,borderRadius:8,background:"#ede9fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>✏️</div>
            <div><div style={{fontSize:13,fontWeight:700,color:"#6d28d9"}}>Escribir a mano</div><div style={{fontSize:11,color:"#94a3b8"}}>Sin receta predefinida</div></div>
          </div>
          {filtered.map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,marginBottom:4,background:value===r.id?"#faf5ff":"transparent",border:value===r.id?"1px solid #a78bfa":"1px solid transparent"}}>
              <div onClick={()=>setPreview(r)} style={{width:36,height:36,borderRadius:8,background:r.categoria==="Entrada"?"#dbeafe":r.categoria==="Principal"?"#dcfce7":"#fce7f3",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,cursor:"pointer"}}>
                {r.categoria==="Entrada"?"🥗":r.categoria==="Principal"?"🍽":"🍮"}
              </div>
              <div onClick={()=>{onChange(r.id,r.nombre);onClose();}} style={{flex:1,minWidth:0,cursor:"pointer"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#1e293b",lineHeight:1.3}}>{r.nombre}</div>
                <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{r.categoria} · {r.calorias} kcal</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                <button onClick={()=>setPreview(r)} style={{padding:"4px 8px",background:"#f1f5f9",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,color:"#64748b",fontFamily:"inherit"}}>Ver</button>
                {value===r.id&&<Icon name="check" size={16} color="#7c3aed"/>}
              </div>
            </div>
          ))}
          {filtered.length===0&&<div style={{textAlign:"center",padding:"24px 0",color:"#94a3b8",fontSize:13}}>Sin resultados</div>}
        </div>
        <div style={{padding:"12px 16px",borderTop:"1px solid #f1f5f9"}}>
          <button onClick={onClose} style={{width:"100%",padding:"10px",background:"#f1f5f9",color:"#64748b",border:"none",borderRadius:10,cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

// ─── INGREDIENT CHECKER ───────────────────────────────────────────────────────
const IngredientChecker = ({ recipeId, ingredientesState, onToggle, onSendToShopping, onConfirm, onClose }) => {
  const recipe=RECIPE_MAP[recipeId];
  if(!recipe) return null;
  const missing=recipe.ingredientes.filter((_,i)=>!ingredientesState[i]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)"}}/>
      <div style={{position:"relative",background:"#fff",borderRadius:20,width:"100%",maxWidth:480,maxHeight:"80vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{padding:"16px 16px 12px",borderBottom:"1px solid #f1f5f9"}}>
          <div style={{fontSize:15,fontWeight:800,color:"#1e293b",marginBottom:2}}>🛒 Verificar ingredientes</div>
          <div style={{fontSize:12,color:"#64748b"}}>{recipe.nombre}</div>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"12px 16px"}}>
          <p style={{fontSize:12,color:"#94a3b8",margin:"0 0 10px"}}>Marcá lo que ya tenés en casa:</p>
          {recipe.ingredientes.map((ing,i)=>{
            const tiene=!!ingredientesState[i];
            return (
              <button key={i} onClick={()=>onToggle(i)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",marginBottom:6,borderRadius:10,border:tiene?"1.5px solid #86efac":"1.5px solid #e2e8f0",background:tiene?"#f0fdf4":"#fff",cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
                <div style={{width:22,height:22,borderRadius:6,background:tiene?"#16a34a":"transparent",border:tiene?"none":"2px solid #cbd5e1",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{tiene&&<Icon name="check" size={13} color="#fff"/>}</div>
                <span style={{fontSize:13,color:tiene?"#15803d":"#1e293b",textDecoration:tiene?"line-through":"none"}}>{ing}</span>
              </button>
            );
          })}
        </div>
        <div style={{padding:"12px 16px",borderTop:"1px solid #f1f5f9",display:"flex",gap:8,flexDirection:"column"}}>
          {missing.length>0&&<button onClick={()=>{onSendToShopping(missing);onConfirm();onClose();}} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"11px",background:"#6366f1",color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontFamily:"inherit",fontSize:14}}><Icon name="shoppingBag" size={16} color="#fff"/>Agregar {missing.length} faltante{missing.length>1?"s":""} a Compras</button>}
          <button onClick={()=>{onConfirm();onClose();}} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"11px",background:"#f0fdf4",color:"#15803d",border:"1.5px solid #86efac",borderRadius:10,cursor:"pointer",fontWeight:700,fontFamily:"inherit",fontSize:14}}><Icon name="check" size={16} color="#15803d"/>{missing.length===0?"¡Tenés todo! Listo":"Listo, ya revisé"}</button>
        </div>
      </div>
    </div>
  );
};

// ─── MENU MODULE ──────────────────────────────────────────────────────────────
const MenuModule = ({ data, setData }) => {
  const week=Array.from({length:7},(_,i)=>addDays(today,i));
  const [editingManual,setEditingManual]=useState(null); const [manualVal,setManualVal]=useState("");
  const [picker,setPicker]=useState(null); const [checker,setChecker]=useState(null);
  const getDay=(date)=>data.menu[date]||{almuerzo:"",almuerzoId:null,almuerzoIngredientes:[],almuerzoVerificado:false,cena:"",cenaId:null,cenaIngredientes:[],cenaVerificado:false};
  const setMeal=(date,meal,recipeId,nombre)=>setData(d=>{const day={...getDay(date)};day[meal]=nombre;day[meal+"Id"]=recipeId;day[meal+"Ingredientes"]=recipeId?new Array(RECIPE_MAP[recipeId].ingredientes.length).fill(false):[];day[meal+"Verificado"]=false;return{...d,menu:{...d.menu,[date]:day}};});
  const toggleIngrediente=(date,meal,idx)=>setData(d=>{const day={...getDay(date)};const arr=[...(day[meal+"Ingredientes"]||[])];arr[idx]=!arr[idx];day[meal+"Ingredientes"]=arr;return{...d,menu:{...d.menu,[date]:day}};});
  const confirmVerificado=(date,meal)=>setData(d=>{const day={...getDay(date)};day[meal+"Verificado"]=true;return{...d,menu:{...d.menu,[date]:day}};});
  const sendToShopping=(date,meal,missing)=>{const recipe=RECIPE_MAP[getDay(date)[meal+"Id"]];setData(d=>{const ex=d.shopping.map(i=>i.item.toLowerCase());const ni=missing.filter(m=>!ex.includes(m.toLowerCase())).map(m=>({id:Date.now()+Math.random(),item:m,qty:"",done:false,category:"Otros",fromRecipe:recipe?.nombre||""}));return{...d,shopping:[...d.shopping,...ni]};});};
  const clearMeal=(date,meal)=>setMeal(date,meal,null,"");
  const saveManual=()=>{if(!editingManual)return;setMeal(editingManual.date,editingManual.meal,null,manualVal);setEditingManual(null);};
  const pendingChecks=week.reduce((acc,d)=>{const day=getDay(fmt(d));["almuerzo","cena"].forEach(meal=>{if(day[meal+"Id"]&&!day[meal+"Verificado"])acc++;});return acc;},0);
  return (
    <div>
      {picker&&<RecipePicker value={getDay(picker.date)[picker.meal+"Id"]} onChange={(id,nombre)=>{if(id===null){setEditingManual(picker);setManualVal("");setPicker(null);}else setMeal(picker.date,picker.meal,id,nombre);}} onClose={()=>setPicker(null)}/>}
      {checker&&<IngredientChecker recipeId={getDay(checker.date)[checker.meal+"Id"]} ingredientesState={getDay(checker.date)[checker.meal+"Ingredientes"]||[]} onToggle={(idx)=>toggleIngrediente(checker.date,checker.meal,idx)} onSendToShopping={(missing)=>sendToShopping(checker.date,checker.meal,missing)} onConfirm={()=>confirmVerificado(checker.date,checker.meal)} onClose={()=>setChecker(null)}/>}
      {pendingChecks>0&&<div style={{display:"flex",alignItems:"center",gap:10,background:"#fefce8",border:"1px solid #fde68a",borderRadius:12,padding:"10px 14px",marginBottom:14}}><Icon name="warn" size={18} color="#d97706"/><span style={{fontSize:13,color:"#92400e",fontWeight:600}}>Hay {pendingChecks} menú{pendingChecks>1?"s":""} sin verificar ingredientes</span></div>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {week.map(d=>{
          const key=fmt(d); const isToday=key===fmt(today); const day=getDay(key);
          return (
            <div key={key} style={{background:isToday?"#faf5ff":"#fff",border:isToday?"1.5px solid #a78bfa":"1px solid #e2e8f0",borderRadius:14,overflow:"hidden"}}>
              <div style={{background:isToday?"#7c3aed":"#f1f5f9",padding:"7px 14px",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontWeight:700,fontSize:13,color:isToday?"#fff":"#475569"}}>{DAYS[d.getDay()]} {d.getDate()}/{d.getMonth()+1}</span>
                {isToday&&<Badge color="purple">Hoy</Badge>}
              </div>
              {["almuerzo","cena"].map((meal,idx)=>{
                const recipeId=day[meal+"Id"]; const nombre=day[meal]; const recipe=recipeId?RECIPE_MAP[recipeId]:null;
                const ing=day[meal+"Ingredientes"]||[]; const verificado=!!day[meal+"Verificado"];
                const missingCount=recipe?recipe.ingredientes.filter((_,i)=>!ing[i]).length:0;
                const isEditing=editingManual?.date===key&&editingManual?.meal===meal;
                return (
                  <div key={meal} style={{borderTop:idx===0?"none":"1px solid #e2e8f0",padding:"10px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                      <span style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase"}}>{meal==="almuerzo"?"🍽 Almuerzo":"🌙 Cena"}</span>
                      {recipe&&!verificado&&<span style={{fontSize:10,fontWeight:700,color:"#d97706",background:"#fef9c3",padding:"1px 6px",borderRadius:8}}>sin verificar</span>}
                      {recipe&&verificado&&missingCount===0&&<span style={{fontSize:10,fontWeight:700,color:"#15803d",background:"#dcfce7",padding:"1px 6px",borderRadius:8}}>✓ Todo ok</span>}
                      {recipe&&verificado&&missingCount>0&&<span style={{fontSize:10,fontWeight:700,color:"#6366f1",background:"#ede9fe",padding:"1px 6px",borderRadius:8}}>{missingCount} a comprar</span>}
                    </div>
                    {isEditing?(
                      <div style={{display:"flex",gap:6}}>
                        <input autoFocus value={manualVal} onChange={e=>setManualVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveManual();if(e.key==="Escape")setEditingManual(null);}} placeholder="Escribí el plato..." style={{flex:1,padding:"6px 10px",borderRadius:8,border:"1.5px solid #6366f1",fontSize:13,fontFamily:"inherit"}}/>
                        <button onClick={saveManual} style={{padding:"6px 10px",background:"#6366f1",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>✓</button>
                        <button onClick={()=>setEditingManual(null)} style={{padding:"6px 10px",background:"#f1f5f9",color:"#64748b",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>✕</button>
                      </div>
                    ):nombre?(
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{nombre}</div>{recipe&&<div style={{fontSize:11,color:"#94a3b8",marginTop:1}}>{recipe.categoria} · {recipe.calorias} kcal</div>}</div>
                        <div style={{display:"flex",gap:5,flexShrink:0}}>
                          {recipe&&<button onClick={()=>setChecker({date:key,meal})} style={{padding:"4px 8px",background:verificado?"#dcfce7":"#fef9c3",color:verificado?"#15803d":"#a16207",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit"}}>{verificado?"✓ Reverificar":"Verificar"}</button>}
                          <button onClick={()=>setPicker({date:key,meal})} style={{padding:"4px 8px",background:"#f1f5f9",color:"#64748b",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Cambiar</button>
                          <button onClick={()=>clearMeal(key,meal)} style={{padding:"4px 6px",background:"#fee2e2",color:"#b91c1c",border:"none",borderRadius:7,cursor:"pointer"}}><Icon name="x" size={12} color="#b91c1c"/></button>
                        </div>
                      </div>
                    ):(
                      <button onClick={()=>setPicker({date:key,meal})} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",background:"transparent",border:"1.5px dashed #e2e8f0",borderRadius:8,cursor:"pointer",fontFamily:"inherit",color:"#94a3b8",fontSize:13,width:"100%"}}>
                        <Icon name="plus" size={14} color="#cbd5e1"/><span>Elegir del recetario o escribir</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── CALENDAR MODULE ──────────────────────────────────────────────────────────
const CalendarModule = ({ data, setData }) => {
  const [selectedDay,setSelectedDay]=useState(fmt(today)); const [newEvent,setNewEvent]=useState({hora:"",texto:""}); const [showForm,setShowForm]=useState(false);
  const [calRange,setCalRange]=useState(7); const [calOffset,setCalOffset]=useState(0);
  const startDay=addDays(today,calOffset*calRange); const days=Array.from({length:calRange},(_,i)=>addDays(startDay,i));
  const weeks=calRange===30?Array.from({length:Math.ceil(days.length/7)},(_,i)=>days.slice(i*7,(i+1)*7)):null;
  const addEvent=()=>{if(!newEvent.hora||!newEvent.texto)return;setData(d=>({...d,events:{...d.events,[selectedDay]:[...(d.events[selectedDay]||[]),{id:Date.now(),...newEvent}]}}));setNewEvent({hora:"",texto:""});setShowForm(false);};
  const removeEvent=(id)=>setData(d=>({...d,events:{...d.events,[selectedDay]:(d.events[selectedDay]||[]).filter(e=>e.id!==id)}}));
  const dayEvents=(data.events[selectedDay]||[]).sort((a,b)=>a.hora.localeCompare(b.hora));
  const DayPill=({d,compact=false})=>{const key=fmt(d);const hasEv=(data.events[key]||[]).length>0;const isToday=key===fmt(today);const isSel=key===selectedDay;return(<button onClick={()=>setSelectedDay(key)} style={{flex:"0 0 auto",minWidth:compact?36:54,padding:compact?"6px 4px":"10px 6px",borderRadius:compact?10:14,border:isSel?"2px solid #6366f1":"2px solid transparent",background:isSel?"#6366f1":isToday?"#ede9fe":"#f8fafc",color:isSel?"#fff":"#334155",cursor:"pointer",textAlign:"center",position:"relative",fontFamily:"inherit"}}><div style={{fontSize:compact?9:10,fontWeight:compact?600:500,opacity:.8}}>{DAYS[d.getDay()]}</div><div style={{fontSize:compact?13:18,fontWeight:700,margin:compact?"1px 0":"2px 0"}}>{d.getDate()}</div>{!compact&&<div style={{fontSize:10,opacity:.7}}>{MONTHS[d.getMonth()]}</div>}{hasEv&&<div style={{width:5,height:5,borderRadius:"50%",background:isSel?"#a5b4fc":"#6366f1",margin:"3px auto 0"}}/>}</button>);};
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",gap:4}}>{[7,14,30].map(n=><button key={n} onClick={()=>{setCalRange(n);setCalOffset(0);}} style={{padding:"5px 12px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,background:calRange===n?"#6366f1":"#f1f5f9",color:calRange===n?"#fff":"#64748b"}}>{n}d</button>)}</div>
        <div style={{display:"flex",gap:4}}>{calOffset>0&&<button onClick={()=>setCalOffset(o=>o-1)} style={{padding:"5px 8px",borderRadius:8,border:"1px solid #e2e8f0",background:"#fff",cursor:"pointer"}}><Icon name="chevronLeft" size={15} color="#64748b"/></button>}<button onClick={()=>setCalOffset(o=>o+1)} style={{padding:"5px 8px",borderRadius:8,border:"1px solid #e2e8f0",background:"#fff",cursor:"pointer"}}><Icon name="chevronRight" size={15} color="#64748b"/></button></div>
      </div>
      {calRange<=14?(<div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:20}}>{days.map(d=><DayPill key={fmt(d)} d={d} compact={calRange===14}/>)}</div>):(
        <div style={{marginBottom:20}}><div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6}}>{DAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:10,fontWeight:700,color:"#94a3b8"}}>{d}</div>)}</div>{weeks.map((week,wi)=>(<div key={wi} style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>{wi===0&&Array.from({length:week[0].getDay()},(_,i)=><div key={"e"+i}/>)}{week.map(d=><DayPill key={fmt(d)} d={d} compact/>)}</div>))}</div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{margin:0,fontSize:15,fontWeight:700,color:"#1e293b"}}>{new Date(selectedDay+"T12:00:00").toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"})}</h3>
        <button onClick={()=>setShowForm(!showForm)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:"#6366f1",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}><Icon name="plus" size={14} color="#fff"/> Agregar</button>
      </div>
      {showForm&&<div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:12,padding:14,marginBottom:14,display:"flex",gap:8,flexWrap:"wrap"}}><input type="time" value={newEvent.hora} onChange={e=>setNewEvent(p=>({...p,hora:e.target.value}))} style={{padding:"7px 10px",borderRadius:8,border:"1px solid #cbd5e1",fontSize:13,fontFamily:"inherit",background:"#fff"}}/><input placeholder="Descripción..." value={newEvent.texto} onChange={e=>setNewEvent(p=>({...p,texto:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addEvent()} style={{flex:1,minWidth:150,padding:"7px 12px",borderRadius:8,border:"1px solid #cbd5e1",fontSize:13,fontFamily:"inherit",background:"#fff"}}/><button onClick={addEvent} style={{padding:"7px 14px",background:"#6366f1",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>Guardar</button></div>}
      {dayEvents.length===0?<div style={{textAlign:"center",padding:"32px 0",color:"#94a3b8",fontSize:14}}>Sin eventos — ¡agregá uno!</div>:<div style={{display:"flex",flexDirection:"column",gap:8}}>{dayEvents.map(ev=>(<div key={ev.id} style={{display:"flex",alignItems:"center",gap:10,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 14px"}}><span style={{fontWeight:700,color:"#6366f1",fontSize:13,minWidth:42}}>{ev.hora}</span><span style={{flex:1,color:"#1e293b",fontSize:14}}>{ev.texto}</span><button onClick={()=>removeEvent(ev.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",padding:2}}><Icon name="trash" size={15}/></button></div>))}</div>}
    </div>
  );
};

// ─── SHOPPING MODULE ──────────────────────────────────────────────────────────
const ShoppingModule = ({ data, setData }) => {
  const [newItem,setNewItem]=useState({item:"",qty:"",category:"Verduras"}); const [showForm,setShowForm]=useState(false);
  const cats=["Verduras","Frutas","Lácteos","Carnes","Panadería","Limpieza","Bebidas","Otros"];
  const addItem=()=>{if(!newItem.item)return;setData(d=>({...d,shopping:[...d.shopping,{id:Date.now()+Math.random(),...newItem,done:false}]}));setNewItem({item:"",qty:"",category:"Verduras"});setShowForm(false);};
  const toggle=(id)=>setData(d=>({...d,shopping:d.shopping.map(i=>i.id===id?{...i,done:!i.done}:i)}));
  const remove=(id)=>setData(d=>({...d,shopping:d.shopping.filter(i=>i.id!==id)}));
  const clearDone=()=>setData(d=>({...d,shopping:d.shopping.filter(i=>!i.done)}));
  const grouped=cats.reduce((acc,cat)=>{const items=data.shopping.filter(i=>i.category===cat);if(items.length)acc[cat]=items;return acc;},{});
  const uncategorized=data.shopping.filter(i=>!cats.includes(i.category));
  if(uncategorized.length)grouped["Otros"]=[...(grouped["Otros"]||[]),...uncategorized];
  const doneCount=data.shopping.filter(i=>i.done).length;
  const catColors={Verduras:"green",Frutas:"orange",Lácteos:"blue",Carnes:"red",Panadería:"orange",Limpieza:"purple",Bebidas:"blue",Otros:"gray"};
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:13,color:"#64748b"}}>{doneCount}/{data.shopping.length} comprados</div>
        <div style={{display:"flex",gap:8}}>
          {doneCount>0&&<button onClick={clearDone} style={{padding:"6px 12px",background:"#f1f5f9",color:"#64748b",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Limpiar ✓</button>}
          <button onClick={()=>setShowForm(!showForm)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:"#6366f1",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}><Icon name="plus" size={14} color="#fff"/> Agregar</button>
        </div>
      </div>
      {showForm&&<div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:12,padding:14,marginBottom:14}}><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><input placeholder="Producto..." value={newItem.item} onChange={e=>setNewItem(p=>({...p,item:e.target.value}))} style={{flex:"1 1 140px",padding:"7px 12px",borderRadius:8,border:"1px solid #cbd5e1",fontSize:13,fontFamily:"inherit"}}/><input placeholder="Cantidad..." value={newItem.qty} onChange={e=>setNewItem(p=>({...p,qty:e.target.value}))} style={{flex:"0 0 90px",padding:"7px 12px",borderRadius:8,border:"1px solid #cbd5e1",fontSize:13,fontFamily:"inherit"}}/><select value={newItem.category} onChange={e=>setNewItem(p=>({...p,category:e.target.value}))} style={{flex:"0 0 120px",padding:"7px 10px",borderRadius:8,border:"1px solid #cbd5e1",fontSize:13,fontFamily:"inherit",background:"#fff"}}>{cats.map(c=><option key={c}>{c}</option>)}</select><button onClick={addItem} style={{padding:"7px 14px",background:"#6366f1",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>Guardar</button></div></div>}
      {Object.keys(grouped).length===0?<div style={{textAlign:"center",padding:"32px 0",color:"#94a3b8",fontSize:14}}>Lista vacía</div>:Object.entries(grouped).map(([cat,items])=>(
        <div key={cat} style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><Badge color={catColors[cat]||"gray"}>{cat}</Badge></div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {items.map(item=>(
              <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 14px",opacity:item.done?.5:1}}>
                <button onClick={()=>toggle(item.id)} style={{width:22,height:22,borderRadius:6,border:item.done?"none":"2px solid #cbd5e1",background:item.done?"#6366f1":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>{item.done&&<Icon name="check" size={13} color="#fff"/>}</button>
                <span style={{flex:1,fontSize:14,color:"#1e293b",textDecoration:item.done?"line-through":"none"}}>{item.item}</span>
                {item.qty&&<span style={{fontSize:12,color:"#94a3b8"}}>{item.qty}</span>}
                {item.fromRecipe&&<span style={{fontSize:10,color:"#7c3aed",background:"#ede9fe",padding:"1px 5px",borderRadius:6}}>receta</span>}
                <button onClick={()=>remove(item.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",padding:2}}><Icon name="trash" size={14}/></button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── TASKS MODULE ─────────────────────────────────────────────────────────────
const TasksModule = ({ data, setData }) => {
  const [newTask,setNewTask]=useState({text:"",priority:"media",date:fmt(today)}); const [showForm,setShowForm]=useState(false);
  const addTask=()=>{if(!newTask.text)return;setData(d=>({...d,tasks:[...d.tasks,{id:Date.now()+Math.random(),...newTask,done:false}]}));setNewTask({text:"",priority:"media",date:fmt(today)});setShowForm(false);};
  const toggle=(id)=>setData(d=>({...d,tasks:d.tasks.map(t=>t.id===id?{...t,done:!t.done}:t)}));
  const remove=(id)=>setData(d=>({...d,tasks:d.tasks.filter(t=>t.id!==id)}));
  const pc={alta:"red",media:"orange",baja:"green"};
  const TaskItem=({task})=>(<div style={{display:"flex",alignItems:"flex-start",gap:10,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 14px",opacity:task.done?.5:1}}><button onClick={()=>toggle(task.id)} style={{width:22,height:22,borderRadius:6,border:task.done?"none":"2px solid #cbd5e1",background:task.done?"#6366f1":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:1}}>{task.done&&<Icon name="check" size={13} color="#fff"/>}</button><div style={{flex:1,minWidth:0}}><div style={{fontSize:14,color:"#1e293b",textDecoration:task.done?"line-through":"none"}}>{task.text}</div><div style={{display:"flex",gap:6,marginTop:4}}><Badge color={pc[task.priority]}>{task.priority}</Badge><span style={{fontSize:11,color:"#94a3b8"}}>{task.date===fmt(today)?"Hoy":task.date}</span></div></div><button onClick={()=>remove(task.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",padding:2}}><Icon name="trash" size={14}/></button></div>);
  const todayT=data.tasks.filter(t=>t.date===fmt(today)&&!t.done); const futureT=data.tasks.filter(t=>t.date>fmt(today)&&!t.done); const doneT=data.tasks.filter(t=>t.done);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}><button onClick={()=>setShowForm(!showForm)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:"#6366f1",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}><Icon name="plus" size={14} color="#fff"/> Nueva tarea</button></div>
      {showForm&&<div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:12,padding:14,marginBottom:16}}><div style={{display:"flex",flexDirection:"column",gap:8}}><input placeholder="Descripción..." value={newTask.text} onChange={e=>setNewTask(p=>({...p,text:e.target.value}))} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #cbd5e1",fontSize:13,fontFamily:"inherit"}} onKeyDown={e=>e.key==="Enter"&&addTask()}/><div style={{display:"flex",gap:8}}><select value={newTask.priority} onChange={e=>setNewTask(p=>({...p,priority:e.target.value}))} style={{flex:1,padding:"7px 10px",borderRadius:8,border:"1px solid #cbd5e1",fontSize:13,fontFamily:"inherit",background:"#fff"}}><option value="alta">🔴 Alta</option><option value="media">🟡 Media</option><option value="baja">🟢 Baja</option></select><input type="date" value={newTask.date} onChange={e=>setNewTask(p=>({...p,date:e.target.value}))} style={{flex:1,padding:"7px 10px",borderRadius:8,border:"1px solid #cbd5e1",fontSize:13,fontFamily:"inherit"}}/><button onClick={addTask} style={{padding:"7px 14px",background:"#6366f1",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>Guardar</button></div></div></div>}
      {todayT.length>0&&<div style={{marginBottom:16}}><p style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 8px"}}>📅 Para hoy</p><div style={{display:"flex",flexDirection:"column",gap:6}}>{todayT.map(t=><TaskItem key={t.id} task={t}/>)}</div></div>}
      {futureT.length>0&&<div style={{marginBottom:16}}><p style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 8px"}}>⏭ Próximas</p><div style={{display:"flex",flexDirection:"column",gap:6}}>{futureT.map(t=><TaskItem key={t.id} task={t}/>)}</div></div>}
      {doneT.length>0&&<div><p style={{fontSize:12,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 8px"}}>✅ Completadas</p><div style={{display:"flex",flexDirection:"column",gap:6}}>{doneT.map(t=><TaskItem key={t.id} task={t}/>)}</div></div>}
      {data.tasks.length===0&&<div style={{textAlign:"center",padding:"32px 0",color:"#94a3b8",fontSize:14}}>Sin tareas</div>}
    </div>
  );
};

// ─── LOLO MODULE ──────────────────────────────────────────────────────────────
const LoloModule = ({ data, setData }) => {
  const [editD,setEditD]=useState(false); const [dVal,setDVal]=useState(data.lolo.desayuno);
  const [editN,setEditN]=useState(false); const [nVal,setNVal]=useState(data.lolo.notas);
  const [newAct,setNewAct]=useState({hora:"",actividad:""}); const [showAF,setShowAF]=useState(false);
  const saveD=()=>{setData(d=>({...d,lolo:{...d.lolo,desayuno:dVal}}));setEditD(false);};
  const saveN=()=>{setData(d=>({...d,lolo:{...d.lolo,notas:nVal}}));setEditN(false);};
  const toggleAct=(id)=>setData(d=>({...d,lolo:{...d.lolo,actividades:d.lolo.actividades.map(a=>a.id===id?{...a,done:!a.done}:a)}}));
  const addAct=()=>{if(!newAct.hora||!newAct.actividad)return;setData(d=>({...d,lolo:{...d.lolo,actividades:[...d.lolo.actividades,{id:Date.now()+Math.random(),...newAct,done:false}]}}));setNewAct({hora:"",actividad:""});setShowAF(false);};
  const removeAct=(id)=>setData(d=>({...d,lolo:{...d.lolo,actividades:d.lolo.actividades.filter(a=>a.id!==id)}}));
  const sorted=[...data.lolo.actividades].sort((a,b)=>a.hora.localeCompare(b.hora));
  const doneCount=sorted.filter(a=>a.done).length;
  return (
    <div>
      <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontWeight:700,fontSize:14,color:"#1e293b"}}>🍳 Desayuno</div><button onClick={()=>setEditD(!editD)} style={{background:"none",border:"none",cursor:"pointer"}}><Icon name="edit" size={15} color="#6366f1"/></button></div>
        {editD?<div style={{display:"flex",gap:8}}><input value={dVal} onChange={e=>setDVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveD()} style={{flex:1,padding:"7px 12px",borderRadius:8,border:"1.5px solid #6366f1",fontSize:13,fontFamily:"inherit"}}/><button onClick={saveD} style={{padding:"7px 12px",background:"#6366f1",color:"#fff",border:"none",borderRadius:8,cursor:"pointer"}}>✓</button></div>
        :<div style={{fontSize:14,color:"#475569"}}>{data.lolo.desayuno||"Sin definir"}</div>}
      </div>
      <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div><div style={{fontWeight:700,fontSize:14,color:"#1e293b"}}>📋 Rutina del día</div><div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{doneCount}/{sorted.length} completadas</div></div><button onClick={()=>setShowAF(!showAF)} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",background:"#6366f1",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}><Icon name="plus" size={13} color="#fff"/> Agregar</button></div>
        <div style={{height:6,background:"#f1f5f9",borderRadius:3,marginBottom:14,overflow:"hidden"}}><div style={{height:"100%",width:`${sorted.length?(doneCount/sorted.length)*100:0}%`,background:"#6366f1",borderRadius:3,transition:"width .3s"}}/></div>
        {showAF&&<div style={{background:"#f8fafc",borderRadius:10,padding:12,marginBottom:12,display:"flex",gap:8,flexWrap:"wrap"}}><input type="time" value={newAct.hora} onChange={e=>setNewAct(p=>({...p,hora:e.target.value}))} style={{padding:"7px 10px",borderRadius:8,border:"1px solid #cbd5e1",fontSize:13,fontFamily:"inherit"}}/><input placeholder="Actividad..." value={newAct.actividad} onChange={e=>setNewAct(p=>({...p,actividad:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addAct()} style={{flex:1,minWidth:120,padding:"7px 12px",borderRadius:8,border:"1px solid #cbd5e1",fontSize:13,fontFamily:"inherit"}}/><button onClick={addAct} style={{padding:"7px 12px",background:"#6366f1",color:"#fff",border:"none",borderRadius:8,cursor:"pointer"}}>✓</button></div>}
        <div style={{display:"flex",flexDirection:"column",gap:6}}>{sorted.map(act=>(<div key={act.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #f1f5f9",opacity:act.done?.6:1}}><button onClick={()=>toggleAct(act.id)} style={{width:22,height:22,borderRadius:6,border:act.done?"none":"2px solid #cbd5e1",background:act.done?"#6366f1":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>{act.done&&<Icon name="check" size={13} color="#fff"/>}</button><span style={{fontWeight:700,color:"#6366f1",fontSize:12,minWidth:42}}>{act.hora}</span><span style={{flex:1,fontSize:14,color:"#1e293b",textDecoration:act.done?"line-through":"none"}}>{act.actividad}</span><button onClick={()=>removeAct(act.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#cbd5e1",padding:2}}><Icon name="trash" size={13}/></button></div>))}</div>
      </div>
      <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontWeight:700,fontSize:14,color:"#1e293b"}}>📝 Notas del día</div><button onClick={()=>setEditN(!editN)} style={{background:"none",border:"none",cursor:"pointer"}}><Icon name="edit" size={15} color="#6366f1"/></button></div>
        {editN?<div><textarea value={nVal} onChange={e=>setNVal(e.target.value)} rows={3} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1.5px solid #6366f1",fontSize:13,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box"}}/><button onClick={saveN} style={{marginTop:8,padding:"6px 14px",background:"#6366f1",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit"}}>Guardar</button></div>
        :<div style={{fontSize:13,color:data.lolo.notas?"#475569":"#cbd5e1",fontStyle:data.lolo.notas?"normal":"italic",whiteSpace:"pre-wrap"}}>{data.lolo.notas||"Sin notas hoy"}</div>}
      </div>
    </div>
  );
};

// ─── NANNY VIEW ───────────────────────────────────────────────────────────────
const NannyView = ({ data, setData, onBack }) => {
  const todayStr=fmt(today); const day=data.menu[todayStr]||{};
  const allTodayTasks=data.tasks.filter(t=>t.date===todayStr);
  const shopping=data.shopping.filter(i=>!i.done);
  const toggle=(id)=>setData(d=>({...d,tasks:d.tasks.map(t=>t.id===id?{...t,done:!t.done}:t)}));
  const toggleAct=(id)=>setData(d=>({...d,lolo:{...d.lolo,actividades:d.lolo.actividades.map(a=>a.id===id?{...a,done:!a.done}:a)}}));
  const sortedActs=[...data.lolo.actividades].sort((a,b)=>a.hora.localeCompare(b.hora));
  const doneActs=sortedActs.filter(a=>a.done).length;
  const [checker,setChecker]=useState(null);
  const confirmVerificado=(date,meal)=>setData(d=>{const dayD={...(d.menu[date]||{})};dayD[meal+"Verificado"]=true;return{...d,menu:{...d.menu,[date]:dayD}};});
  const toggleIngrediente=(date,meal,idx)=>setData(d=>{const dayD={...(d.menu[date]||{})};const arr=[...(dayD[meal+"Ingredientes"]||[])];arr[idx]=!arr[idx];dayD[meal+"Ingredientes"]=arr;return{...d,menu:{...d.menu,[date]:dayD}};});
  const sendToShopping=(date,meal,missing)=>{const recipe=RECIPE_MAP[(data.menu[date]||{})[meal+"Id"]];setData(d=>{const ex=d.shopping.map(i=>i.item.toLowerCase());const ni=missing.filter(m=>!ex.includes(m.toLowerCase())).map(m=>({id:Date.now()+Math.random(),item:m,qty:"",done:false,category:"Otros",fromRecipe:recipe?.nombre||""}));return{...d,shopping:[...d.shopping,...ni]};});};
  const mealAlert=["almuerzo","cena"].some(meal=>{const rId=day[meal+"Id"];if(!rId)return false;return !day[meal+"Verificado"];});
  return (
    <div style={{minHeight:"100vh",background:"#f0fdf4",fontFamily:"'Inter',system-ui,sans-serif"}}>
      {checker&&<IngredientChecker recipeId={(data.menu[todayStr]||{})[checker+"Id"]} ingredientesState={(data.menu[todayStr]||{})[checker+"Ingredientes"]||[]} onToggle={(idx)=>toggleIngrediente(todayStr,checker,idx)} onSendToShopping={(m)=>sendToShopping(todayStr,checker,m)} onConfirm={()=>confirmVerificado(todayStr,checker)} onClose={()=>setChecker(null)}/>}
      <div style={{background:"#16a34a",padding:"20px 20px 16px",color:"#fff"}}>
        <div style={{fontSize:22,fontWeight:800,marginBottom:2}}>👋 ¡Hola!</div>
        <div style={{fontSize:14,opacity:.85}}>{today.toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"})}</div>
        <button onClick={onBack} style={{marginTop:12,padding:"5px 12px",background:"rgba(255,255,255,.2)",color:"#fff",border:"1px solid rgba(255,255,255,.3)",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>← Volver al panel</button>
      </div>
      <div style={{padding:"16px 16px 40px",maxWidth:500,margin:"0 auto"}}>
        {mealAlert&&<div style={{background:"#fefce8",border:"1px solid #fde68a",borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}><Icon name="warn" size={18} color="#d97706"/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#92400e"}}>⚠️ Hay ingredientes sin verificar</div><div style={{display:"flex",gap:6,marginTop:4}}>{["almuerzo","cena"].map(meal=>{const rId=day[meal+"Id"];if(!rId||day[meal+"Verificado"])return null;return <button key={meal} onClick={()=>setChecker(meal)} style={{padding:"3px 10px",background:"#fde68a",color:"#92400e",border:"none",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>{meal==="almuerzo"?"Verificar almuerzo":"Verificar cena"}</button>;})}</div></div></div>}
        <div style={{background:"#fff",borderRadius:16,padding:16,marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
          <div style={{fontSize:13,fontWeight:800,color:"#15803d",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>🍽 Menú de hoy</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{[["almuerzo","Almuerzo"],["cena","Cena"]].map(([k,l])=>(<div key={k} style={{background:"#f0fdf4",borderRadius:10,padding:12}}><div style={{fontSize:10,fontWeight:700,color:"#86efac",textTransform:"uppercase",marginBottom:4}}>{l}</div><div style={{fontSize:13,fontWeight:600,color:day[k]?"#14532d":"#d1fae5"}}>{day[k]||"Sin definir"}</div></div>))}</div>
        </div>
        <div style={{background:"#fff",borderRadius:16,padding:16,marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
          <div style={{fontSize:13,fontWeight:800,color:"#15803d",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>✅ Tareas — {allTodayTasks.filter(t=>t.done).length}/{allTodayTasks.length} listas</div>
          {allTodayTasks.length===0?<div style={{color:"#86efac",fontSize:13,textAlign:"center",padding:"10px 0"}}>Sin tareas 🎉</div>:<div style={{display:"flex",flexDirection:"column",gap:8}}>{allTodayTasks.map(t=>(<button key={t.id} onClick={()=>toggle(t.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:t.done?"#f0fdf4":"#fff",border:t.done?"1.5px solid #86efac":"1.5px solid #e2e8f0",borderRadius:10,cursor:"pointer",textAlign:"left",fontFamily:"inherit",width:"100%"}}><div style={{width:24,height:24,borderRadius:8,background:t.done?"#16a34a":"transparent",border:t.done?"none":"2px solid #d1fae5",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{t.done&&<Icon name="check" size={14} color="#fff"/>}</div><span style={{fontSize:15,color:t.done?"#86efac":"#14532d",textDecoration:t.done?"line-through":"none",fontWeight:500}}>{t.text}</span></button>))}</div>}
        </div>
        <div style={{background:"#fff",borderRadius:16,padding:16,marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
          <div style={{fontSize:13,fontWeight:800,color:"#15803d",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>👶 Lolo — {doneActs}/{sortedActs.length} actividades</div>
          <div style={{background:"#f0fdf4",borderRadius:8,padding:"8px 12px",marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:"#86efac",marginBottom:2}}>DESAYUNO</div><div style={{fontSize:14,color:"#14532d",fontWeight:600}}>{data.lolo.desayuno||"Sin definir"}</div></div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>{sortedActs.map(act=>(<button key={act.id} onClick={()=>toggleAct(act.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:act.done?"#f0fdf4":"#fff",border:act.done?"1.5px solid #86efac":"1.5px solid #e2e8f0",borderRadius:8,cursor:"pointer",textAlign:"left",fontFamily:"inherit",width:"100%"}}><div style={{width:22,height:22,borderRadius:6,background:act.done?"#16a34a":"transparent",border:act.done?"none":"2px solid #d1fae5",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{act.done&&<Icon name="check" size={12} color="#fff"/>}</div><span style={{fontSize:12,fontWeight:700,color:"#16a34a",minWidth:40}}>{act.hora}</span><span style={{fontSize:14,color:act.done?"#86efac":"#14532d",textDecoration:act.done?"line-through":"none"}}>{act.actividad}</span></button>))}</div>
          {data.lolo.notas&&<div style={{marginTop:10,background:"#fefce8",borderRadius:8,padding:"8px 12px",fontSize:13,color:"#713f12"}}>📝 {data.lolo.notas}</div>}
        </div>
        {shopping.length>0&&<div style={{background:"#fff",borderRadius:16,padding:16,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}><div style={{fontSize:13,fontWeight:800,color:"#15803d",textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>🛒 Faltan comprar</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{shopping.map(i=>(<div key={i.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f0fdf4",fontSize:14,color:"#14532d"}}><span>{i.item}</span><span style={{color:"#86efac",fontWeight:600}}>{i.qty}</span></div>))}</div></div>}
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function CasaHub() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");
  const [showNanny, setShowNanny] = useState(false);
  const [showModules, setShowModules] = useState(false);

  // Load from Firestore + subscribe to real-time updates
  useEffect(() => {
    const unsub = onSnapshot(DOC_REF, (snap) => {
      if (snap.exists()) {
        setData(snap.data());
      } else {
        const d = defaultData();
        saveToFirestore(d);
        setData(d);
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setData(defaultData());
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Save to Firestore on every change (debounced)
  useEffect(() => {
    if (!data) return;
    setSyncing(true);
    const t = setTimeout(() => {
      saveToFirestore(data).finally(() => setSyncing(false));
    }, 800);
    return () => clearTimeout(t);
  }, [data]);

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#f8fafc",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{fontSize:40,marginBottom:16}}>🏠</div>
      <div style={{fontSize:16,fontWeight:700,color:"#6366f1"}}>Cargando Casa Hub...</div>
    </div>
  );

  if (showNanny) return <NannyView data={data} setData={setData} onBack={()=>setShowNanny(false)}/>;

  const allTabs = MODULE_CATALOG.map(m=>({id:m.id,label:m.label,icon:m.icon}));
  const tabs = allTabs.filter(t=>data.activeModules.includes(t.id));
  const safeTab = tabs.find(t=>t.id===activeTab)?activeTab:tabs[0]?.id;
  const pendingTasks = data.tasks.filter(t=>t.date===fmt(today)&&!t.done).length;
  const pendingShopping = data.shopping.filter(i=>!i.done).length;
  const todayMenu = data.menu[fmt(today)]||{};
  const pendingIngredients = ["almuerzo","cena"].filter(meal=>{const rId=todayMenu[meal+"Id"];if(!rId)return false;return !todayMenu[meal+"Verificado"];}).length;

  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'Inter',system-ui,sans-serif",maxWidth:680,margin:"0 auto"}}>
      {showModules&&<ModuleManager data={data} setData={setData} onClose={()=>setShowModules(false)}/>}
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:20,fontWeight:800,color:"#1e293b",letterSpacing:-.5}}>🏠 Casa Hub</div>
            {syncing&&<Icon name="sync" size={14} color="#94a3b8"/>}
          </div>
          <div style={{fontSize:12,color:"#94a3b8"}}>{today.toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"})}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {pendingTasks>0&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"4px 10px",fontSize:12,color:"#b91c1c",fontWeight:600}}>{pendingTasks} hoy</div>}
          {pendingIngredients>0&&<div style={{background:"#fefce8",border:"1px solid #fde68a",borderRadius:8,padding:"4px 10px",fontSize:12,color:"#a16207",fontWeight:600}}>🛒 verificar</div>}
          <button onClick={()=>setShowNanny(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",background:"#16a34a",color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}><Icon name="user" size={14} color="#fff"/> Niñera</button>
          <button onClick={()=>setShowModules(true)} style={{width:36,height:36,borderRadius:10,background:"#6366f1",color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="grid" size={17} color="#fff"/></button>
        </div>
      </div>
      <div style={{display:"flex",background:"#fff",borderBottom:"1px solid #e2e8f0",overflowX:"auto"}}>
        {tabs.map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{flex:"0 0 auto",display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 16px",border:"none",background:"transparent",cursor:"pointer",borderBottom:safeTab===tab.id?"2.5px solid #6366f1":"2.5px solid transparent",color:safeTab===tab.id?"#6366f1":"#94a3b8",fontFamily:"inherit",transition:"all .15s",position:"relative"}}>
            <Icon name={tab.icon} size={18} color={safeTab===tab.id?"#6366f1":"#94a3b8"}/>
            <span style={{fontSize:11,fontWeight:600}}>{tab.label}</span>
            {tab.id==="tasks"&&pendingTasks>0&&<span style={{position:"absolute",top:6,right:8,width:16,height:16,background:"#ef4444",borderRadius:"50%",fontSize:9,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{pendingTasks}</span>}
            {tab.id==="shopping"&&pendingShopping>0&&<span style={{position:"absolute",top:6,right:8,width:16,height:16,background:"#f59e0b",borderRadius:"50%",fontSize:9,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{pendingShopping}</span>}
            {tab.id==="menu"&&pendingIngredients>0&&<span style={{position:"absolute",top:6,right:8,width:16,height:16,background:"#d97706",borderRadius:"50%",fontSize:9,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{pendingIngredients}</span>}
          </button>
        ))}
      </div>
      <div style={{padding:"18px 16px 40px"}}>
        {safeTab==="calendar" && <CalendarModule data={data} setData={setData}/>}
        {safeTab==="menu"     && <MenuModule     data={data} setData={setData}/>}
        {safeTab==="shopping" && <ShoppingModule data={data} setData={setData}/>}
        {safeTab==="tasks"    && <TasksModule    data={data} setData={setData}/>}
        {safeTab==="lolo"     && <LoloModule     data={data} setData={setData}/>}
      </div>
    </div>
  );
}
