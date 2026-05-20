const COMMITMENTS = [
  { icon: "fa-shield-alt", text: "Cam kết hàng chính hãng" },
  { icon: "fa-truck", text: "Miễn phí giao hàng đơn từ 799k" },
  { icon: "fa-undo", text: "Miễn phí đổi trả đến 14 ngày" },
] as const;

export function CommitmentBar() {
  return (
    <div className="commitment-bar" role="region" aria-label="Cam kết dịch vụ">
      <div className="commitment-bar-inner">
        {COMMITMENTS.map((item) => (
          <div key={item.text} className="commitment-bar-item">
            <i className={`fas ${item.icon}`} aria-hidden="true" />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
