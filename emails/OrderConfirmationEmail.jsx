import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export function OrderConfirmationEmail({
  customerName = "Bạn",
  orderId = "",
  totalAmount = "0đ",
  paidAmount = "0đ",
  remainingAmount = "0đ",
  items = [],
  historyUrl = "https://stusport.vercel.app/tai-khoan",
}) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <Html>
      <Head />
      <Preview>Xác nhận đặt hàng & Thanh toán thành công</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={brandBar}>
            <Text style={brandText}>STUSPORT</Text>
          </Section>
          <Section style={content}>
            <Heading style={heading}>Xác nhận đặt hàng &amp; Thanh toán thành công</Heading>
            <Text style={paragraph}>Xin chào {customerName},</Text>
            <Text style={paragraph}>
              Cảm ơn bạn đã thanh toán đơn hàng tại STUSPORT. Dưới đây là thông
              tin giao dịch của bạn:
            </Text>

            <Section style={summaryBox}>
              <Text style={summaryLine}>
                <strong>Mã đơn hàng:</strong> #{orderId}
              </Text>
              <Text style={summaryLine}>
                <strong>Tổng đơn hàng:</strong> {totalAmount}
              </Text>
              <Text style={summaryLine}>
                <strong>Đã thanh toán (cọc):</strong> {paidAmount}
              </Text>
              <Text style={summaryLine}>
                <strong>Còn lại:</strong> {remainingAmount}
              </Text>
            </Section>

            {safeItems.length > 0 ? (
              <Section style={itemsBox}>
                <Text style={itemsTitle}>Sản phẩm đã mua</Text>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Sản phẩm</th>
                      <th style={thRight}>SL</th>
                      <th style={thRight}>Đơn giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeItems
                      .filter((it) => it && typeof it === "object")
                      .slice(0, 20)
                      .map((it, idx) => {
                        const name = typeof it?.name === "string" ? it.name : "Sản phẩm";
                        const size =
                          typeof it?.size === "string" && it.size.trim()
                            ? ` — Size ${it.size}`
                            : "";
                        const qty = Math.max(0, Number(it?.quantity) || 0);
                        const unit = Math.max(0, Number(it?.unit_price) || 0);
                        return (
                          <tr key={`${idx}-${name}`}>
                            <td style={td}>
                              {name}
                              {size}
                            </td>
                            <td style={tdRight}>{qty}</td>
                            <td style={tdRight}>
                              {unit ? `${unit.toLocaleString("vi-VN")}đ` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </Section>
            ) : null}

            <Text style={paragraph}>
              Đơn hàng của bạn đã được ghi nhận trên hệ thống. Nhân viên của
              STUSPORT sẽ chủ động liên hệ với bạn qua Zalo trong thời gian sớm
              nhất để xác nhận và xử lý bước tiếp theo.
            </Text>

            <Section style={buttonWrap}>
              <Button href={historyUrl} style={button}>
                Theo dõi lịch sử đơn hàng
              </Button>
            </Section>
          </Section>
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>STUSPORT - Streetwear & Sport Essentials</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default OrderConfirmationEmail;

const main = {
  backgroundColor: "#0a0a0a",
  margin: 0,
  padding: "24px 0",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const container = {
  backgroundColor: "#141414",
  borderRadius: "14px",
  border: "1px solid #2b2b2b",
  maxWidth: "560px",
  overflow: "hidden",
};

const brandBar = {
  backgroundColor: "#ff4d00",
  padding: "10px 20px",
};

const brandText = {
  color: "#ffffff",
  fontWeight: 700,
  fontSize: "13px",
  letterSpacing: "2px",
  margin: 0,
};

const content = {
  padding: "24px 20px 20px",
};

const heading = {
  color: "#ffffff",
  fontSize: "24px",
  lineHeight: "32px",
  margin: "0 0 16px",
  fontWeight: 700,
};

const paragraph = {
  color: "#d6d6d6",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 14px",
};

const summaryBox = {
  backgroundColor: "#1d1d1d",
  border: "1px solid #343434",
  borderRadius: "10px",
  padding: "12px 14px",
  margin: "16px 0",
};

const summaryLine = {
  color: "#f2f2f2",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 6px",
};

const itemsBox = {
  backgroundColor: "#1d1d1d",
  border: "1px solid #343434",
  borderRadius: "10px",
  padding: "12px 14px",
  margin: "0 0 16px",
};

const itemsTitle = {
  color: "#f2f2f2",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 10px",
  fontWeight: 700,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "left",
  color: "#cfcfcf",
  fontSize: "12px",
  padding: "8px 0",
  borderBottom: "1px solid #343434",
};

const thRight = {
  ...th,
  textAlign: "right",
};

const td = {
  color: "#f2f2f2",
  fontSize: "13px",
  padding: "8px 0",
  borderBottom: "1px solid #2b2b2b",
};

const tdRight = {
  ...td,
  textAlign: "right",
  whiteSpace: "nowrap",
};

const buttonWrap = {
  marginTop: "22px",
  marginBottom: "8px",
};

const button = {
  backgroundColor: "#ff4d00",
  color: "#ffffff",
  borderRadius: "999px",
  padding: "12px 20px",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 600,
};

const divider = {
  borderColor: "#2e2e2e",
  margin: 0,
};

const footer = {
  padding: "12px 20px 18px",
};

const footerText = {
  color: "#8e8e8e",
  fontSize: "12px",
  margin: 0,
};
