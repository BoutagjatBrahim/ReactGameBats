// src/utils/emailTemplates.js
import mjml2html from "mjml";

export function getVerificationEmailTemplate(verificationLink) {
  const mjmlTemplate = `
    <mjml>
      <mj-body>
        <mj-section>
          <mj-column>
            <mj-text font-size="20px" color="#F45E43" font-family="helvetica">Welcome to Our App!</mj-text>
            <mj-text font-size="16px">Please verify your email address by clicking the link below:</mj-text>
            <mj-button href="${verificationLink}" background-color="#F45E43">Verify Email</mj-button>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>`
    ;

  return mjml2html(mjmlTemplate).html;
}