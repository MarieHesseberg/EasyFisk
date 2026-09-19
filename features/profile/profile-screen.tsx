"use client";
import { useAppServices } from "@/data/runtime/services-provider";

import { useState } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import { appContentRepository } from "@/data/repositories/app-content";
import { useLocalProfile } from "./use-local-profile";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import type { DetailDestination } from "@/domain/navigation/navigation";
import type { DemoStatus } from "@/domain/fishing-rules/rule";
import { findDemoStatus } from "@/domain/fishing-rules/find-demo-status";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { ProfileDetailDialog } from "@/features/profile/profile-detail-dialog";
import { StatusEngineSettingsDialog } from "@/features/profile/status-engine-settings-dialog";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";
import type { PrototypePaymentOutcome } from "@/domain/fishing-permits/permit-purchase";
import { useLanguage } from "@/components/localization/language-provider";

type ProfileDestination = DetailDestination | "status-engine";

export function ProfileScreen({
  demoStatus,
  documentReadiness,
  isStatusTestMode,
  selectDemoStatus,
  testDemoStatus,
  useActualStatus,
  openStatistics,
  openPermitShop,
  paymentOutcome,
  setPaymentOutcome,
}: {
  demoStatus: DemoStatus;
  documentReadiness: DocumentReadiness;
  isStatusTestMode: boolean;
  selectDemoStatus: (status: DemoStatus) => void;
  testDemoStatus: () => void;
  useActualStatus: () => void;
  openStatistics: () => void;
  openPermitShop: () => void;
  paymentOutcome: PrototypePaymentOutcome;
  setPaymentOutcome: (outcome: PrototypePaymentOutcome) => void;
}) {
  const [detail, setDetail] = useState<ProfileDestination | null>(null);
  const { t } = useLanguage();
  const { mode } = useAppServices();
  const profile = useLocalProfile();
  const scenarios = fishingContentRepository.getDemoScenarios();
  const selectedScenario = findDemoStatus(demoStatus, scenarios);
  return (
    <div className="screen">
      <ScreenHeader title={t("navigation.more")} />
      <button className="more-profile-card" onClick={() => setDetail("profile-privacy")}>
        <div className="avatar">
          {profile.fullName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((name) => name[0])
            .join("") || "•"}
        </div>
        <div>
          <h2>{t("copy.fiskerprofil.3593163")}</h2>
          <p>{profile.fullName || t("copy.navn.32dae7e")}</p>
        </div>
        <Icon name="chevron" />
      </button>
      <div className="menu-list">
        <button onClick={() => setDetail("control-card")}>
          <span>
            <Icon name="shield" />
          </span>
          <p>
            <b>{t("copy.mine.dokumenter.39d5623")}</b>
          </p>
          <Icon name="chevron" size={18} />
        </button>
        <button onClick={openPermitShop}>
          <span>
            <Icon name="ticket" />
          </span>
          <p>
            <b>{t("copy.fiskekort.og.kj.p.77edfa0")}</b>
            <small>{t("copy.utforsk.kort.etter.sone.og.korttype.af2d056")}</small>
          </p>
          <Icon name="chevron" size={18} />
        </button>
        <button onClick={openStatistics}>
          <span>
            <Icon name="stats" />
          </span>
          <p>
            <b>{t("copy.statistikk.og.fiskehistorikk.0dccf78")}</b>
            <small>{t("copy.mandalselva.og.dine.registrerte.fiske.kter.e6af393")}</small>
          </p>
          <Icon name="chevron" size={18} />
        </button>
        {appContentRepository
          .getContent()
          .profile.menuItems.map(({ destination, icon, title, description }) => (
            <button key={destination} onClick={() => setDetail(destination)}>
              <span>
                <Icon name={icon} />
              </span>
              <p>
                <b>{t(title)}</b>
                <small>{t(description)}</small>
              </p>
              <Icon name="chevron" size={18} />
            </button>
          ))}
        <button onClick={() => setDetail("fee")}>
          <span>
            <Icon name="book" />
          </span>
          <p>
            <b>{t("copy.statlig.fiskeravgift.ed960f5")}</b>
            <small>{t("copy.registrer.kvittering.eller.fritak.6c23476")}</small>
          </p>
          <Icon name="chevron" size={18} />
        </button>
        <button onClick={() => setDetail("messages")}>
          <span>
            <Icon name="bell" />
          </span>
          <p>
            <b>{t("feedback.mine")}</b>
            <small>{t("feedback.historyDescription")}</small>
          </p>
          <Icon name="chevron" size={18} />
        </button>
        <button onClick={() => setDetail("reset-data")}>
          <span>
            <Icon name="settings" />
          </span>
          <p>
            <b>{t("reset.title")}</b>
            <small>{t("reset.description")}</small>
          </p>
          <Icon name="chevron" size={18} />
        </button>
        {mode === "demo" && (
          <button onClick={() => setDetail("status-engine")}>
            <span>
              <Icon name="stats" />
            </span>
            <p>
              <b>{t("copy.statusmotor.9cef87d")}</b>
              <small>{t("copy.velg.situasjon.for.prototypens.statuskontroll.5bd6f62")}</small>
            </p>
            <Icon name="chevron" size={18} />
          </button>
        )}
      </div>
      <section className="more-feedback-card">
        <small>{t("copy.tilbakemelding.og.observasjon.874b945")}</small>
        <h3>{t("copy.meld.fra.til.elveeigarlaget.c011953")}</h3>
        <p>{t("copy.velg.kategori.legg.ved.bilde.og.valgfri.posisjon.871fba0")}</p>
        <button onClick={() => setDetail("feedback")}>{t("copy.opprett.melding.99f0597")}</button>
      </section>
      <p className="version">
        EasyFisk · {t("copy.innhold.kontrollert.f924dee")}{" "}
        {activeFishingRules.metadata.numericSourcesCheckedLabel}
      </p>
      {mode === "demo" && detail === "status-engine" && (
        <StatusEngineSettingsDialog
          close={() => setDetail(null)}
          scenarios={scenarios}
          selected={selectedScenario}
          isTestMode={isStatusTestMode}
          selectStatus={selectDemoStatus}
          startTest={testDemoStatus}
          useActualStatus={useActualStatus}
          paymentOutcome={paymentOutcome}
          setPaymentOutcome={setPaymentOutcome}
        />
      )}
      {detail && detail !== "status-engine" && (
        <ProfileDetailDialog
          destination={detail}
          close={() => setDetail(null)}
          testReadiness={isStatusTestMode ? documentReadiness : undefined}
          openPermitShop={() => {
            setDetail(null);
            openPermitShop();
          }}
        />
      )}
    </div>
  );
}
