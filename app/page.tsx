import { ResetBoundary } from "@/features/reset/reset-boundary";
import { EasyFiskApp } from "@/components/layout/easy-fisk-app";
import { LanguageProvider } from "@/components/localization/language-provider";

export default function Page() {
  return (
    <LanguageProvider>
      <ResetBoundary>
        <EasyFiskApp />
      </ResetBoundary>
    </LanguageProvider>
  );
}
