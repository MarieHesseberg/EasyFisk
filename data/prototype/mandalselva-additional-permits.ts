import type {
  PrototypePermitProduct,
  PrototypePermitProductDetails,
} from "@/domain/fishing-permits/prototype-permit-product";
import { getZoneSeasonEnd } from "@/domain/zones/zone-rules";

// Public Inatur listings and linked day-permit prices checked 17 September 2026.
const sources = {
  "61fd1cb3aa826b7f6d5e2ddc": {
    url: "https://www.inatur.no/laksefiske/61fd1cb3aa826b7f6d5e2ddc",
    seller: {
      organization: "Mandalselva Elveeigarlag",
      contactName: "Karl Gjermund Damli",
      phone: "+47 90144337",
      email: "kgjd@online.no",
    },
  },
  "620644599957fb2634c20f9d": {
    url: "https://www.inatur.no/laksefiske/620644599957fb2634c20f9d",
    seller: {
      organization: "Mandalselva Elveeigarlag",
      contactName: "Karl Gjermund Damli",
      phone: "+47 90144337",
      email: "kgjd@online.no",
    },
  },
  "6203ca9c6f3607461547101b": {
    url: "https://www.inatur.no/laksefiske/6203ca9c6f3607461547101b",
    seller: {
      organization: "Fossefjellene Laksefiske",
      contactName: "Kirstine Fuskeland",
      phone: "97140120",
      email: "kirstinefusk@gmail.com",
    },
  },
  "67e6777499e92a3dd68b708e": {
    url: "https://www.inatur.no/laksefiske/67e6777499e92a3dd68b708e",
    seller: {
      organization: "Mandalselva Øvre Holum, Hauge",
      contactName: "Hallvar Hauge",
      phone: "90266599",
      email: "hallvard@haugelaks.no",
    },
  },
  "5a4ca9abe4b0209d64304e1f": {
    url: "https://www.inatur.no/laksefiske/5a4ca9abe4b0209d64304e1f",
    seller: {
      organization: "Mandalselva Øvre Holum, Holmesland",
      contactName: "Per Gunnar Holmesland",
      phone: "476 37 917",
      email: "per@siving.net",
    },
  },
  "62012e7c3bfa4c2e1e2fa6e9": {
    url: "https://www.inatur.no/laksefiske/62012e7c3bfa4c2e1e2fa6e9",
    seller: {
      organization: "Mandalselva Elveeigarlag",
      contactName: "Karl Gjermund Damli",
      phone: "+47 90144337",
      email: "kgjd@online.no",
    },
  },
  "62050d9388e8992ae437c7a4": {
    url: "https://www.inatur.no/laksefiske/62050d9388e8992ae437c7a4",
    seller: {
      organization: "Mandalselva Elveeigarlag",
      contactName: "Karl Gjermund Damli",
      phone: "+47 90144337",
      email: "kgjd@online.no",
    },
  },
  "620652e79957fb2634c21004": {
    url: "https://www.inatur.no/laksefiske/620652e79957fb2634c21004",
    seller: {
      organization: "Mandalselva Elveeigarlag",
      contactName: "Karl Gjermund Damli",
      phone: "+47 90144337",
      email: "kgjd@online.no",
    },
  },
  "62078e1929f7c11a486f16a5": {
    url: "https://www.inatur.no/laksefiske/62078e1929f7c11a486f16a5",
    seller: {
      organization: "Mandalselva Elveeigarlag",
      contactName: "Karl Gjermund Damli",
      phone: "+47 90144337",
      email: "kgjd@online.no",
    },
  },
  "620794fe29f7c11a486f16de": {
    url: "https://www.inatur.no/laksefiske/620794fe29f7c11a486f16de",
    seller: {
      organization: "Mandalselva Elveeigarlag",
      contactName: "Karl Gjermund Damli",
      phone: "+47 90144337",
      email: "kgjd@online.no",
    },
  },
  "6207ae4229f7c11a486f175f": {
    url: "https://www.inatur.no/laksefiske/6207ae4229f7c11a486f175f",
    seller: {
      organization: "Mandalselva Elveeigarlag",
      contactName: "Karl Gjermund Damli",
      phone: "+47 90144337",
      email: "kgjd@online.no",
    },
  },
  "6207b4b629f7c11a486f178c": {
    url: "https://www.inatur.no/laksefiske/6207b4b629f7c11a486f178c",
    seller: {
      organization: "Mandalselva Elveeigarlag",
      contactName: "Karl Gjermund Damli",
      phone: "+47 90144337",
      email: "kgjd@online.no",
    },
  },
  "6207b8866472570ca032b905": {
    url: "https://www.inatur.no/laksefiske/6207b8866472570ca032b905",
    seller: {
      organization: "Mandalselva Elveeigarlag",
      contactName: "Karl Gjermund Damli",
      phone: "+47 90144337",
      email: "kgjd@online.no",
    },
  },
  "6207bd4c29f7c11a486f17ba": {
    url: "https://www.inatur.no/laksefiske/6207bd4c29f7c11a486f17ba",
    seller: {
      organization: "Mandalselva Elveeigarlag",
      contactName: "Karl Gjermund Damli",
      phone: "+47 90144337",
      email: "kgjd@online.no",
    },
  },
  "6207cb8e6472570ca032b95c": {
    url: "https://www.inatur.no/laksefiske/6207cb8e6472570ca032b95c",
    seller: {
      organization: "Mandalselva Elveeigarlag",
      contactName: "Karl Gjermund Damli",
      phone: "+47 90144337",
      email: "kgjd@online.no",
    },
  },
  "6207c22629f7c11a486f17c5": {
    url: "https://www.inatur.no/laksefiske/6207c22629f7c11a486f17c5",
    seller: {
      organization: "Mandalselva Elveeigarlag",
      contactName: "Karl Gjermund Damli",
      phone: "+47 90144337",
      email: "kgjd@online.no",
    },
  },
} as const;

type ResearchedPermit = {
  id: string;
  zoneId: 2 | 4;
  areaName: string;
  amountNok: number;
  sourceId: keyof typeof sources;
  priceUrl: string;
  permitsPerFishingDay?: number;
  calendarDay?: boolean;
};
const researchedPermits: readonly ResearchedPermit[] = [
  {
    id: "zone-2-bringsdal-a-day",
    zoneId: 2,
    areaName: "Bringsdal A",
    amountNok: 250,
    sourceId: "61fd1cb3aa826b7f6d5e2ddc",
    priceUrl: "https://www.scanatura.no/webshop/?Id=1612&objektid=119182",
  },
  {
    id: "zone-2-bringsdal-b-day",
    zoneId: 2,
    areaName: "Bringsdal B",
    amountNok: 250,
    sourceId: "61fd1cb3aa826b7f6d5e2ddc",
    priceUrl: "https://www.scanatura.no/webshop/?Id=1612&objektid=119185",
  },
  {
    id: "zone-2-bringsdal-c-day",
    zoneId: 2,
    areaName: "Bringsdal C",
    amountNok: 250,
    sourceId: "61fd1cb3aa826b7f6d5e2ddc",
    priceUrl: "https://www.scanatura.no/webshop/?Id=1612&objektid=119184",
  },
  {
    id: "zone-2-moll-day",
    zoneId: 2,
    areaName: "Møll",
    amountNok: 100,
    sourceId: "620644599957fb2634c20f9d",
    priceUrl:
      "https://www.scanatura.no/webshop/default.aspx?ID=1618&ObjektID=119202&produktID=119203",
  },
  {
    id: "zone-2-fossefjellene-syd-day",
    zoneId: 2,
    areaName: "Fossefjellene syd",
    amountNok: 450,
    sourceId: "6203ca9c6f3607461547101b",
    priceUrl: "https://www.scanatura.no/webshop/default.aspx?ID=1623&ObjektID=119228",
    permitsPerFishingDay: 2,
  },
  {
    id: "zone-2-hauge-a-day",
    zoneId: 2,
    areaName: "Hauge A",
    amountNok: 450,
    sourceId: "67e6777499e92a3dd68b708e",
    priceUrl: "https://www.scanatura.no/webshop/?ID=1785&objektid=120438",
  },
  {
    id: "zone-2-hauge-b1-day",
    zoneId: 2,
    areaName: "Hauge B1",
    amountNok: 450,
    sourceId: "67e6777499e92a3dd68b708e",
    priceUrl: "https://www.scanatura.no/webshop/?ID=1785&objektid=120440",
  },
  {
    id: "zone-2-hauge-b2-day",
    zoneId: 2,
    areaName: "Hauge B2",
    amountNok: 425,
    sourceId: "67e6777499e92a3dd68b708e",
    priceUrl: "https://www.scanatura.no/webshop/?ID=1785&objektid=120441",
  },
  {
    id: "zone-2-hauge-c-day",
    zoneId: 2,
    areaName: "Hauge C",
    amountNok: 650,
    sourceId: "67e6777499e92a3dd68b708e",
    priceUrl: "https://www.scanatura.no/webshop/?ID=1785&objektid=120442",
  },
  {
    id: "zone-2-hauge-d-day",
    zoneId: 2,
    areaName: "Hauge D",
    amountNok: 350,
    sourceId: "67e6777499e92a3dd68b708e",
    priceUrl: "https://www.scanatura.no/webshop/?ID=1785&objektid=120443",
  },
  {
    id: "zone-2-holmesland-a-day",
    zoneId: 2,
    areaName: "Holmesland A",
    amountNok: 590,
    sourceId: "5a4ca9abe4b0209d64304e1f",
    priceUrl: "https://www.scanatura.no/webshop/?ID=1043&objektid=116099",
  },
  {
    id: "zone-2-holmesland-b-day",
    zoneId: 2,
    areaName: "Holmesland B",
    amountNok: 375,
    sourceId: "5a4ca9abe4b0209d64304e1f",
    priceUrl: "https://www.scanatura.no/webshop/?ID=1043&objektid=116098",
  },
  {
    id: "zone-2-holmesland-c-day",
    zoneId: 2,
    areaName: "Holmesland C",
    amountNok: 325,
    sourceId: "5a4ca9abe4b0209d64304e1f",
    priceUrl: "https://www.scanatura.no/webshop/?ID=1043&objektid=116097",
  },
  {
    id: "zone-2-holmesland-p-day",
    zoneId: 2,
    areaName: "Holmesland P",
    amountNok: 670,
    sourceId: "5a4ca9abe4b0209d64304e1f",
    priceUrl: "https://www.scanatura.no/webshop/?ID=1043&objektid=116096",
  },
  {
    id: "zone-2-smeland-day",
    zoneId: 2,
    areaName: "Smeland",
    amountNok: 250,
    sourceId: "62012e7c3bfa4c2e1e2fa6e9",
    priceUrl: "https://www.scanatura.no/webshop/?Id=1614&objektid=119191&Produktid=119192",
  },
  {
    id: "zone-2-heia-day",
    zoneId: 2,
    areaName: "Heia",
    amountNok: 100,
    sourceId: "62050d9388e8992ae437c7a4",
    priceUrl: "https://www.scanatura.no/webshop/default.aspx?ID=1616&ObjektID=119198",
    permitsPerFishingDay: 2,
  },
  {
    id: "zone-2-nedre-holum-day",
    zoneId: 2,
    areaName: "Nedre Holum",
    amountNok: 50,
    sourceId: "620652e79957fb2634c21004",
    priceUrl:
      "https://www.scanatura.no/webshop/default.aspx?ID=1619&ObjektID=119204&produktID=119205",
  },
  {
    id: "zone-2-nedre-noding-day",
    zoneId: 2,
    areaName: "Nedre Nøding",
    amountNok: 350,
    sourceId: "62078e1929f7c11a486f16a5",
    priceUrl: "https://www.scanatura.no/webshop/default.aspx?ID=1620&ObjektID=119206",
    permitsPerFishingDay: 2,
  },
  {
    id: "zone-2-stoveland-day",
    zoneId: 2,
    areaName: "Stoveland",
    amountNok: 200,
    sourceId: "620794fe29f7c11a486f16de",
    priceUrl: "https://www.scanatura.no/webshop/default.aspx?ID=1621&ObjektID=119208",
  },
  {
    id: "zone-2-grimefossen-a-day",
    zoneId: 2,
    areaName: "Grimefossen A",
    amountNok: 400,
    sourceId: "620794fe29f7c11a486f16de",
    priceUrl: "https://www.scanatura.no/webshop/default.aspx?ID=1621&ObjektID=119217",
    permitsPerFishingDay: 3,
  },
  {
    id: "zone-2-grimefossen-b-day",
    zoneId: 2,
    areaName: "Grimefossen B",
    amountNok: 400,
    sourceId: "620794fe29f7c11a486f16de",
    priceUrl: "https://www.scanatura.no/webshop/default.aspx?ID=1621&ObjektID=119277",
    permitsPerFishingDay: 4,
  },
  {
    id: "zone-4-steinshylen-day",
    zoneId: 4,
    areaName: "Steinshylen",
    amountNok: 1000,
    sourceId: "6207ae4229f7c11a486f175f",
    priceUrl: "https://www.scanatura.no/webshop/?Id=1631&objektid=119259",
    permitsPerFishingDay: 2,
  },
  {
    id: "zone-4-bjahylen-day",
    zoneId: 4,
    areaName: "Bjåhylen",
    amountNok: 800,
    sourceId: "6207b4b629f7c11a486f178c",
    priceUrl: "https://www.scanatura.no/webshop/?Id=1625&objektid=119233",
    permitsPerFishingDay: 3,
  },
  {
    id: "zone-4-nodehylen-day",
    zoneId: 4,
    areaName: "Nodehylen",
    amountNok: 1000,
    sourceId: "6207b8866472570ca032b905",
    priceUrl: "https://www.scanatura.no/webshop/?Id=1626&objektid=119237",
    permitsPerFishingDay: 3,
  },
  {
    id: "zone-4-straedethylen-day",
    zoneId: 4,
    areaName: "Strædethylen",
    amountNok: 600,
    sourceId: "6207bd4c29f7c11a486f17ba",
    priceUrl: "https://www.scanatura.no/webshop/?Id=1627&objektid=119239",
    permitsPerFishingDay: 2,
  },
  {
    id: "zone-4-laksehylen-day",
    zoneId: 4,
    areaName: "Laksehylen",
    amountNok: 1000,
    sourceId: "6207cb8e6472570ca032b95c",
    priceUrl: "https://www.scanatura.no/webshop/?Id=1628&objektid=119241",
    permitsPerFishingDay: 2,
  },
  {
    id: "zone-4-felles-nord-manflavann-day",
    zoneId: 4,
    areaName: "Felles Nord Manflåvann",
    amountNok: 300,
    sourceId: "6207c22629f7c11a486f17c5",
    priceUrl: "https://www.scanatura.no/webshop/?Id=1630&objektid=119245&Produktid=119246",
    calendarDay: true,
  },
];

export const additionalPermitProducts: readonly PrototypePermitProduct[] = researchedPermits.map(
  (record) => ({
    id: record.id,
    zoneId: record.zoneId,
    areaName: record.areaName,
    title: record.areaName + " døgnkort",
    type: "day",
    action: "purchase",
    availability: { status: "available", label: "Ledig", remainingUnits: null },
    validity: {
      ...(record.calendarDay
        ? { label: "Valgt fiskedøgn" }
        : { label: "Kl. 18.00–17.59 neste dag", startsAt: "18:00", endsAt: "17:59" }),
      seasonEndsOn: getZoneSeasonEnd(record.zoneId, record.areaName),
    },
    capacity: record.permitsPerFishingDay
      ? {
          label: record.permitsPerFishingDay + " døgnkort per fiskedøgn",
          permitsPerFishingDay: record.permitsPerFishingDay,
        }
      : { label: "Personlig fiskekort" },
    price: { amountNok: record.amountNok, status: "verified" },
    requirements: {
      requiresNationalFishingFee: true,
      requiresDisinfection: true,
      requiresRuleAcceptance: true,
    },
    source: {
      url: sources[record.sourceId].url,
      priceUrl: record.priceUrl,
      checkedAt: "2026-09-17",
      status: "verified-public-source",
    },
    seller: sources[record.sourceId].seller,
    note: "",
  }),
);

export const additionalPermitDetails: Record<string, Partial<PrototypePermitProductDetails>> = {
  "zone-2-bringsdal-a-day": {
    equipmentAndFacilities: [
      "Lett tilgjengelig elvefiske med varierte fiskeplasser.",
      "Følg skiltingen for grensene til delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-bringsdal-b-day": {
    equipmentAndFacilities: [
      "Lett tilgjengelig elvefiske med varierte fiskeplasser.",
      "Følg skiltingen for grensene til delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-bringsdal-c-day": {
    equipmentAndFacilities: [
      "Lett tilgjengelig elvefiske med varierte fiskeplasser.",
      "Følg skiltingen for grensene til delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-moll-day": {
    equipmentAndFacilities: [
      "Flere fiskestrekninger på begge sider av elva.",
      "Følg skiltingen for grensene til delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-fossefjellene-syd-day": {
    equipmentAndFacilities: [
      "Fiske fra fjellet nedenfor Grimefossen. Robåt inngår ikke.",
      "Skiltet parkering fra Daleveien. Gapahuk, bålpanne og utedo.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-hauge-a-day": {
    equipmentAndFacilities: [
      "Kortet gjelder én fisker i den valgte delsonen.",
      "Følg skiltingen for grensene til delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-hauge-b1-day": {
    equipmentAndFacilities: [
      "Kortet gjelder én fisker i den valgte delsonen.",
      "Følg skiltingen for grensene til delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-hauge-b2-day": {
    equipmentAndFacilities: [
      "Kortet gjelder én fisker i den valgte delsonen.",
      "Følg skiltingen for grensene til delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-hauge-c-day": {
    equipmentAndFacilities: [
      "Kortet gjelder én fisker i den valgte delsonen.",
      "Følg skiltingen for grensene til delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-hauge-d-day": {
    equipmentAndFacilities: [
      "Kortet gjelder én fisker i den valgte delsonen.",
      "Følg skiltingen for grensene til delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-holmesland-a-day": {
    equipmentAndFacilities: [
      "Gapahuk og enkelt toalett ved fiskeplassen.",
      "Mulighet for telt ved delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-holmesland-b-day": {
    equipmentAndFacilities: [
      "Båt er inkludert i fiskekortet.",
      "Kortet gjelder én fisker i den valgte delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-holmesland-c-day": {
    equipmentAndFacilities: [
      "Gapahuk og enkelt toalett ved fiskeplassen.",
      "Kortet gjelder én fisker i den valgte delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-holmesland-p-day": {
    equipmentAndFacilities: [
      "Gapahuk og enkelt toalett ved fiskeplassen.",
      "Kortet gjelder én fisker i den valgte delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-smeland-day": {
    equipmentAndFacilities: [
      "Jevn strøm med standplasser for laks og sjøørret.",
      "Ingen begrensning i antall fiskekort.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-heia-day": {
    equipmentAndFacilities: ["Fiskeplasser som egner seg særlig for mark og sluk."],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-nedre-holum-day": {
    equipmentAndFacilities: [
      "Roligere elvestrekning med strøm på enkelte partier. Båtfiske er tillatt på deler av området.",
      "Følg skiltingen for grensene til delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-nedre-noding-day": {
    localRules: ["Maksimalt to fiskedøgn per person per uke."],
    equipmentAndFacilities: [
      "Maksimalt to fiskedøgn per person per uke.",
      "Følg skiltingen for grensene til delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-stoveland-day": {
    equipmentAndFacilities: [
      "Jevn strøm med standplasser for laks og sjøørret.",
      "Følg skiltingen for grensene til delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-grimefossen-a-day": {
    equipmentAndFacilities: [
      "Kortet gjelder én fisker i den valgte delsonen.",
      "Følg skiltingen for grensene til delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-2-grimefossen-b-day": {
    equipmentAndFacilities: [
      "Kortet gjelder én fisker i den valgte delsonen.",
      "Følg skiltingen for grensene til delsonen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-4-steinshylen-day": {
    localRules: [
      "Fiske er forbudt forbi bebyggelsen sør for Bjåhylen. Ingen ferdsel på øvre del av østre elvebredd.",
    ],
    equipmentAndFacilities: [
      "Godt egnet for fluefiske. Følg skiltingen mellom Bjåhylen og Klevelandsbroa.",
      "Fiske er forbudt forbi bebyggelsen sør for Bjåhylen. Ingen ferdsel på øvre del av østre elvebredd.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-4-bjahylen-day": {
    equipmentAndFacilities: [
      "Rolig elvestrekning med fiske fra begge sider.",
      "Adkomst til østsiden via gårdene på Kleveland. Bruk anvist parkering.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-4-nodehylen-day": {
    equipmentAndFacilities: [
      "Varierte stryk og dype kulper, med fiske fra deler av Storøy.",
      "Adkomst til østsiden via gårdene på Kleveland. Bruk anvist parkering.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-4-straedethylen-day": {
    equipmentAndFacilities: [
      "Fiske ved Storøy mellom Laksehylen og Nodehylen. Gapahuker kan benyttes.",
      "Anvist parkering langs Rv. 455 ved det gamle grustaket.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-4-laksehylen-day": {
    localRules: [
      "Fiskeforbud 50 meter ovenfor og nedenfor terskelen.",
      "Adkomst til østsiden via Haugedalsbroa. Ingen gjennomkjøring ved Kleveland.",
    ],
    equipmentAndFacilities: [
      "Stryk og dype kulper sør for dammen ved Manflåvann.",
      "Fiskeforbud 50 meter ovenfor og nedenfor terskelen.",
      "Adkomst til østsiden via Haugedalsbroa. Ingen gjennomkjøring ved Kleveland.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
  "zone-4-felles-nord-manflavann-day": {
    localRules: [
      "Stryk, fosser og dype kulper. Kortet dekker ikke de separate delsonene nedenfor dammen.",
    ],
    equipmentAndFacilities: [
      "Kortet dekker hovedsonen oppstrøms dam Manflå, til Kavfossen og lakseførende del av Kosåna.",
      "Stryk, fosser og dype kulper. Kortet dekker ikke de separate delsonene nedenfor dammen.",
    ],
    reportingRule: "Rapporter fangst eller nullfangst etter fiskedøgnet.",
  },
};
