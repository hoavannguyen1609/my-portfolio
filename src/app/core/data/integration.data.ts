import { CodeSample, Integration, IntegrationKind, IntegrityStep, Txt } from '../models';

export const INTEGRATION_HEAD = {
  label: { vi: 'Tích hợp & toàn vẹn dữ liệu', en: 'Integration & data integrity' } as Txt,
  title: { vi: 'Nối hệ thống lớn mà không rơi một bản ghi', en: 'Connecting large systems without dropping a record' } as Txt,
  lead: {
    vi: 'Hệ thống chính phủ số hiếm khi đứng một mình. Một văn bản đi qua trục liên thông quốc gia, hệ thống ký số, hệ thống giao việc; một hồ sơ thi hành án tra dữ liệu dân cư, đồng bộ chứng từ kế toán. Mỗi mối nối là một chỗ dữ liệu có thể mất, trùng hoặc lệch trạng thái. Phần này ghi lại các hệ thống tôi đã nối và cách tôi giữ dữ liệu đúng ở từng mối nối.',
    en: 'Digital-government systems rarely stand alone. A document travels through the national interconnection axis, a signing service and a task system; an enforcement case looks up population data and syncs accounting documents. Every connection is a place where data can be lost, duplicated or drift out of state. This section lists the systems I have connected and how I keep data correct at each joint.',
  } as Txt,
  mapTitle: { vi: 'Bản đồ tích hợp', en: 'Integration map' } as Txt,
  mapHint: { vi: 'Chọn một hệ thống để xem chi tiết', en: 'Pick a system to see the details' } as Txt,
  guaranteesTitle: { vi: 'Bảo đảm dữ liệu', en: 'Data guarantees' } as Txt,
  protocolTitle: { vi: 'Giao thức', en: 'Protocol' } as Txt,
  journeyTitle: { vi: '7 chốt giữ toàn vẹn dữ liệu', en: '7 checkpoints that keep data intact' } as Txt,
  journeyLead: {
    vi: 'Đường đi của một bản tin từ lúc nghiệp vụ ghi xuống tới khi hệ thống bên kia xác nhận. Bỏ một chốt là có một kiểu lỗi dữ liệu cụ thể.',
    en: 'The path of one message from the business write until the other side confirms it. Skip one checkpoint and you get a specific kind of data bug.',
  } as Txt,
  riskLabel: { vi: 'Nếu bỏ qua', en: 'If skipped' } as Txt,
  safetyTitle: { vi: 'Chốt an toàn khi chạy thử', en: 'Safety switches for testing' } as Txt,
  safety: [
    {
      vi: 'Công tắc tắt mọi lệnh ghi lên trục: vẫn dựng và lưu XML, ghi nhật ký "chỉ ghi log", không gửi gói nào ra ngoài.',
      en: 'A kill switch for every write to the axis: XML is still built and stored, logged as "log only", nothing leaves the system.',
    },
    {
      vi: 'Chế độ đơn vị thử: tự gán mã cơ quan test khi dựng gói; chốt cuối dò mọi mã thật, thấy là không gửi.',
      en: 'Test-agency mode: packages get a test agency code; a final guard scans for any real code and refuses to send.',
    },
  ] as Txt[],
  rulesTitle: { vi: 'Quy tắc ở tầng dữ liệu', en: 'Rules at the data layer' } as Txt,
  rules: [
    {
      t: { vi: 'Đọc ngay sau ghi thì đọc CSDL', en: 'Read-after-write hits the database' },
      d: { vi: 'Index Elasticsearch làm mới sau khoảng 1 giây; màn hình cần kết quả tức thì đọc MySQL.', en: 'Elasticsearch refreshes after about a second; screens that need instant results read MySQL.' },
    },
    {
      t: { vi: 'Field denormalize sửa đủ mọi nơi', en: 'Denormalised fields change everywhere' },
      d: { vi: 'Một field văn bản nằm ở hai index tìm kiếm: thêm field là sửa đủ các đường ghi, thiếu một chỗ là một tab mất bộ lọc.', en: 'A document field lives in two search indexes: every write path must change, or one tab silently loses its filter.' },
    },
    {
      t: { vi: 'Truy vấn sẵn sàng sharding', en: 'Sharding-ready queries' },
      d: { vi: 'Mọi WHERE có khoá tenant, không JOIN chéo shard, danh sách IN chia lô tối đa 500.', en: 'Every WHERE carries the tenant key, no cross-shard JOINs, IN lists chunked to 500.' },
    },
    {
      t: { vi: 'Sinh id hàng loạt phải đối chiếu', en: 'Bulk IDs are checked first' },
      d: { vi: 'Id sinh từ worker, bộ đếm và thời gian có thể trùng khi sinh dồn dập; đối chiếu id đã có trước khi insert.', en: 'IDs built from worker, counter and time can collide in bursts; check existing IDs before inserting.' },
    },
    {
      t: { vi: 'QueryDSL thay chuỗi JPQL', en: 'QueryDSL over string JPQL' },
      d: { vi: 'Kiểm tra kiểu lúc biên dịch; tránh derived query hiểu sai tên field (orgIn thành từ khoá In).', en: 'Type-checked at compile time; avoids derived queries misreading field names (orgIn parsed as In).' },
    },
    {
      t: { vi: 'Migration chạy được trên hai bản MySQL', en: 'Migrations that run on two MySQL versions' },
      d: { vi: 'Liquibase mỗi bảng một file; changeSet riêng MySQL 8 có precondition để môi trường MySQL 5.7 không lỗi.', en: 'Liquibase one file per table; MySQL 8-only changeSets carry preconditions so MySQL 5.7 environments do not fail.' },
    },
  ] as { t: Txt; d: Txt }[],
};

export const KIND_LABEL: Record<IntegrationKind, Txt> = {
  national: { vi: 'Nền tảng quốc gia', en: 'National platform' },
  internal: { vi: 'Hệ thống nội bộ', en: 'Internal system' },
  partner: { vi: 'Đối tác', en: 'Partner' },
  platform: { vi: 'Dịch vụ hạ tầng', en: 'Platform service' },
};

export const INTEGRATIONS: Integration[] = [
  {
    id: 'vdxp',
    name: { vi: 'Trục liên thông văn bản quốc gia', en: 'National document interconnection axis' },
    short: 'VDXP',
    kind: 'national',
    hub: 'eDLM',
    direction: 'both',
    protocol: { vi: 'Gói edXML · gói trạng thái · REST qua cổng tích hợp', en: 'edXML packages · status packages · REST via integration gateway' },
    summary: {
      vi: 'Gửi và nhận văn bản điện tử giữa các cơ quan. Tôi tách toàn bộ nghiệp vụ trục thành service vdxp riêng, giao tiếp với eDLM bằng Kafka command/event theo từng phân hệ.',
      en: 'Sends and receives electronic documents between agencies. I moved all axis logic into a dedicated vdxp service that talks to eDLM through Kafka commands/events per subsystem.',
    },
    guarantees: [
      { vi: 'Chỉ báo "đã nhận" cho trục sau khi văn bản đến đã lưu và commit đủ cho mọi đơn vị nhận; gói lỗi parse thì không phản hồi để trục gửi lại.', en: 'Acknowledge the axis only after the incoming document is stored and committed for every recipient; unparsable packages get no ack, so the axis resends.' },
      { vi: 'Trạng thái văn bản đi khớp theo mã văn bản và đơn vị gửi, không bao giờ lùi trạng thái; lưu xong mới xác nhận gói trạng thái.', en: 'Outgoing status matches on document ID and sender, never moves backwards, and is acknowledged only after it is saved.' },
      { vi: 'Mỗi lượt gửi là một bản ghi riêng; gửi lại theo từng nơi nhận và chỉ khi lượt trước lỗi; nhật ký theo batchId.', en: 'Each send is its own record; resends go per recipient and only after a failure; audit logs keyed by batchId.' },
      { vi: 'Khoá lạc quan @Version trên bảng sự kiện trạng thái để hai luồng không ghi đè nhau.', en: 'Optimistic locking with @Version on the status-event table so two flows never overwrite each other.' },
    ],
  },
  {
    id: 'etask',
    name: { vi: 'Hệ thống giao việc eTask', en: 'eTask task system' },
    short: 'eTask',
    kind: 'internal',
    hub: 'eDLM',
    direction: 'both',
    protocol: { vi: 'Kafka · outbox · saga', en: 'Kafka · outbox · saga' },
    summary: {
      vi: 'Mỗi hành động trên văn bản tạo hoặc cập nhật dự án và việc bên eTask; kết quả từ eTask quay về cập nhật luồng văn bản.',
      en: 'Every document action creates or updates projects and tasks in eTask; results flow back to update the document workflow.',
    },
    guarantees: [
      { vi: 'Outbox: bản tin chỉ phát sau khi giao dịch nghiệp vụ commit; lưu cả request lẫn response của từng bản tin.', en: 'Outbox: messages publish only after the business transaction commits; both request and response are stored.' },
      { vi: 'Chỉ nhận kết quả thuộc eDLM: mã văn bản phải tồn tại và khoá phải khớp dòng đã gửi đi.', en: 'Only accept results that belong to eDLM: the document must exist and the key must match an outbound row.' },
      { vi: 'Mỗi service một consumer group riêng; dùng chung group thì một bên mất bản tin.', en: 'One consumer group per service; a shared group means one side silently loses messages.' },
      { vi: 'Nhật ký saga ghi trong giao dịch riêng (REQUIRES_NEW) để rollback không xoá dấu vết.', en: 'Saga logs are written in their own transaction (REQUIRES_NEW) so a rollback never erases the trail.' },
    ],
  },
  {
    id: 'sign',
    name: { vi: 'Ký số & đóng dấu', en: 'Digital signing & stamping' },
    short: { vi: 'Ký số', en: 'Signing' },
    kind: 'partner',
    hub: 'eDLM',
    direction: 'both',
    protocol: { vi: 'REST · callback trạng thái', en: 'REST · status callbacks' },
    summary: {
      vi: 'Gửi văn bản cho đơn vị đóng dấu, nhận lại tệp đã đóng dấu, huỷ đóng dấu và ban hành bổ sung.',
      en: 'Sends documents for stamping, receives stamped files, handles stamp cancellation and supplementary issuance.',
    },
    guarantees: [
      { vi: 'Mỗi lượt có mã giao dịch riêng; huỷ đóng dấu lưu mã huỷ riêng, không ghi đè mã gốc.', en: 'Each round has its own transaction ID; cancellation stores a separate cancel ID instead of overwriting the original.' },
      { vi: 'Mã đơn vị phải khớp đúng một đơn vị trong tenant, không suy đoán.', en: 'The unit code must match exactly one unit in the tenant; no guessing.' },
      { vi: 'Thu hồi đóng dấu gỡ chữ ký thành bản mới ở khoá lưu trữ mới, tệp gốc giữ nguyên.', en: 'Revoking a stamp strips signatures into a new file at a new storage key; the original stays untouched.' },
    ],
  },
  {
    id: 'ai',
    name: { vi: 'Dịch vụ AI quét QR/OCR', en: 'AI QR/OCR service' },
    short: 'AI OCR',
    kind: 'platform',
    hub: 'eDLM',
    direction: 'out',
    protocol: 'Spring WebClient',
    summary: {
      vi: 'Quét mã QR trên bản giấy để tự gắn bản quét vào đúng văn bản.',
      en: 'Reads QR codes on paper copies to attach each scan to the right document.',
    },
    guarantees: [
      { vi: 'Kiểm tra health trước khi gọi, chuyển tiếp token của người gọi để giữ phân quyền.', en: 'Health-check before calling, forwarding the caller token to keep permissions intact.' },
      { vi: 'Chỉ lưu tệp khi mã QR khớp đúng văn bản đích; không khớp thì trả lỗi rõ ràng.', en: 'Store the file only when the QR matches the target document; otherwise return a clear error.' },
    ],
  },
  {
    id: 'c06',
    name: { vi: 'Dữ liệu dân cư C06 · VNeID', en: 'Population data C06 · VNeID' },
    short: 'C06',
    kind: 'national',
    hub: 'THADS',
    direction: 'out',
    protocol: { vi: 'REST qua cổng tích hợp · bất đồng bộ', en: 'REST via integration gateway · async' },
    summary: {
      vi: 'Xác minh thông tin đương sự; dịch vụ có thể mất 15–120 giây mới trả lời.',
      en: 'Verifies party identity; the service can take 15–120 seconds to answer.',
    },
    guarantees: [
      { vi: 'Executor riêng có hàng đợi giới hạn, timeout cứng và huỷ tác vụ quá hạn; lỗi map rõ 429/502/503/504.', en: 'A dedicated bounded executor, hard timeout and cancellation; errors mapped clearly to 429/502/503/504.' },
      { vi: 'Không nuốt exception: lỗi nghiệp vụ ném lại nguyên trạng để giao diện hiển thị đúng.', en: 'No swallowed exceptions: business errors are rethrown as-is so the UI shows the right message.' },
      { vi: 'Lưu lịch sử tra cứu và xác minh của từng đương sự để đối chiếu về sau.', en: 'Every lookup and verification is kept in history for later reconciliation.' },
    ],
  },
  {
    id: 'misa',
    name: { vi: 'Kế toán MISA', en: 'MISA accounting' },
    short: 'MISA',
    kind: 'partner',
    hub: 'THADS',
    direction: 'in',
    protocol: { vi: 'REST · đồng bộ chứng từ', en: 'REST · document sync' },
    summary: {
      vi: 'Đồng bộ chứng từ thuế, thu chi từ MISA vào dòng tiền thi hành án.',
      en: 'Syncs tax and payment documents from MISA into the enforcement cash flow.',
    },
    guarantees: [
      { vi: 'Kiểm tra khớp số tiền trước khi ghi nhận vào dòng tiền.', en: 'Amounts are checked before being recorded into the cash flow.' },
      { vi: 'Ghi nhật ký và kết quả tích hợp theo từng lượt để biết bản ghi nào đã vào, bản ghi nào lỗi.', en: 'Each run writes an integration log and result, so you know which records landed and which failed.' },
    ],
  },
  {
    id: 'receipt',
    name: { vi: 'Biên lai điện tử', en: 'E-receipts' },
    short: { vi: 'Biên lai', en: 'Receipts' },
    kind: 'partner',
    hub: 'THADS',
    direction: 'both',
    protocol: { vi: 'REST · index tìm kiếm riêng', en: 'REST · dedicated search index' },
    summary: {
      vi: 'Cho hệ thống biên lai tra cứu hồ sơ thi hành án và lưu biên lai phát hành ngược về hồ sơ.',
      en: 'Lets the receipt system look up enforcement cases and stores issued receipts back on the case.',
    },
    guarantees: [
      { vi: 'Biên lai bên ngoài lưu bảng riêng, có index Elasticsearch riêng; xoá theo mã phiếu thay vì xoá mềm lẫn lộn.', en: 'External receipts live in their own table and index; deletes go by ticket ID rather than mixed soft deletes.' },
      { vi: 'Truy vết từng lần tra cứu để đối chiếu khi số liệu lệch.', en: 'Every lookup is traced, so mismatched numbers can be reconciled.' },
    ],
  },
  {
    id: 'agency',
    name: { vi: 'Đối soát với bộ ngành', en: 'Ministry reconciliation' },
    short: { vi: 'Bộ ngành', en: 'Ministries' },
    kind: 'national',
    hub: 'THADS',
    direction: 'both',
    protocol: { vi: 'REST · mã phiếu và mã phong bì', en: 'REST · ticket and envelope IDs' },
    summary: {
      vi: 'Trao đổi thông tin đương sự với hệ thống của bộ ngành khác và lưu lịch sử đối soát.',
      en: 'Exchanges party information with other ministries and keeps a reconciliation history.',
    },
    guarantees: [
      { vi: 'Mỗi lượt đối soát mang mã phiếu và mã phong bì riêng thay cho traceId chung, truy được tới từng lượt.', en: 'Each reconciliation carries its own ticket and envelope IDs instead of a shared traceId, traceable per round.' },
      { vi: 'Trạng thái dùng lại một bộ trạng thái chung để hai bên hiểu giống nhau.', en: 'Statuses reuse one shared status set so both sides read them the same way.' },
    ],
  },
];

export const INTEGRITY_STEPS: IntegrityStep[] = [
  {
    title: { vi: 'Một giao dịch nghiệp vụ', en: 'One business transaction' },
    mechanism: { vi: 'Ranh giới @Transactional đặt ở hàm luồng nghiệp vụ; dữ liệu và bản ghi outbox commit cùng nhau.', en: '@Transactional boundaries sit on the business flow method; data and the outbox row commit together.' },
    risk: { vi: 'Phát bản tin rồi rollback: hệ thống bên kia thấy dữ liệu không còn tồn tại.', en: 'Publish, then roll back: the other system sees data that no longer exists.' },
    tags: ['@Transactional', 'Outbox'],
  },
  {
    title: { vi: 'Phát sau commit', en: 'Publish after commit' },
    mechanism: { vi: 'TransactionSynchronization.afterCommit gửi bản tin; mọi lệnh ghi ở đây chạy trong giao dịch mới REQUIRES_NEW.', en: 'TransactionSynchronization.afterCommit sends the message; any write there runs in a new REQUIRES_NEW transaction.' },
    risk: { vi: 'Ghi trong afterCommit không có giao dịch mới: bản ghi mất mà không báo lỗi.', en: 'Writing in afterCommit without a new transaction: the row is lost with no error.' },
    tags: ['afterCommit', 'REQUIRES_NEW'],
  },
  {
    title: { vi: 'Định danh từng lượt', en: 'An ID for every round' },
    mechanism: { vi: 'Mỗi lượt gửi có requestId/batchId riêng; lưu cả request và response vào cùng một bản ghi.', en: 'Each send gets its own requestId/batchId; request and response are stored on one record.' },
    risk: { vi: 'Không phân biệt lượt gửi lại với lượt gốc, không đối soát được khi hai bên lệch.', en: 'Resends look like originals, and mismatches between systems cannot be reconciled.' },
    tags: ['requestId', 'batchId', '{request, response}'],
  },
  {
    title: { vi: 'Đúng nơi nhận', en: 'The right consumer' },
    mechanism: { vi: 'Mỗi service một consumer group; bản tin quay về chỉ được nhận khi khoá khớp dòng đã gửi đi.', en: 'One consumer group per service; inbound messages are accepted only when the key matches an outbound row.' },
    risk: { vi: 'Dùng chung group: Kafka chia bản tin cho service khác, một bên mất dữ liệu.', en: 'A shared group: Kafka hands messages to the other service and one side loses data.' },
    tags: ['consumer group', 'ownership check'],
  },
  {
    title: { vi: 'Trạng thái một chiều', en: 'Forward-only status' },
    mechanism: { vi: 'Trạng thái chỉ tiến, không lùi; khoá lạc quan @Version chặn hai luồng ghi đè nhau.', en: 'Status only moves forward; optimistic locking with @Version stops two flows from overwriting each other.' },
    risk: { vi: 'Gói trạng thái đến muộn đè lên trạng thái mới hơn, văn bản "quay về" bước cũ.', en: 'A late status package overwrites a newer state and the document "goes back" a step.' },
    tags: ['@Version', 'state machine'],
  },
  {
    title: { vi: 'Xác nhận sau cùng', en: 'Acknowledge last' },
    mechanism: { vi: 'Chỉ báo "đã nhận" cho bên gửi sau khi đã lưu và commit đủ; dữ liệu lỗi thì không xác nhận để bên kia gửi lại.', en: 'Acknowledge the sender only after everything is stored and committed; bad data gets no ack, so it is resent.' },
    risk: { vi: 'Bên gửi nghĩ đã giao nhưng bên nhận chưa lưu: văn bản biến mất giữa hai hệ thống.', en: 'The sender thinks it delivered but nothing was saved: the document vanishes between systems.' },
    tags: ['confirmDone', 'at-least-once'],
  },
  {
    title: { vi: 'Đối soát & gửi lại', en: 'Reconcile & resend' },
    mechanism: { vi: 'Nhật ký theo lượt, job quét trạng thái, API gửi lại theo từng nơi nhận, API nạp lại index tìm kiếm.', en: 'Per-round logs, a status-sweep job, per-recipient resend APIs and search re-index APIs.' },
    risk: { vi: 'Một lỗi mạng tạm thời trở thành mất dữ liệu vĩnh viễn, không ai biết.', en: 'A transient network error becomes permanent data loss that nobody notices.' },
    tags: ['audit log', 'resend', 're-index'],
  },
];

export const CODE_SAMPLES: CodeSample[] = [
  {
    file: 'AfterCommitPublisher.java',
    caption: { vi: 'Phát bản tin và ghi nhật ký saga chỉ sau khi giao dịch chính đã commit.', en: 'Publish and write the saga log only after the main transaction commits.' },
    code: `// Ghi nhật ký saga và phát bản tin chỉ sau khi giao dịch chính đã commit
TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
    @Override
    public void afterCommit() {
        sagaLogService.saveLogSagaInNewTransaction(sagaLog); // REQUIRES_NEW
        outboundSender.send(event);                          // không phát khi rollback
    }
});`,
  },
  {
    file: 'StatusEventService.java',
    caption: { vi: 'Trạng thái chỉ tiến, khoá lạc quan chặn ghi đè đồng thời.', en: 'Forward-only status, optimistic locking against concurrent overwrites.' },
    code: `// Gói trạng thái đến muộn không được kéo văn bản về bước cũ
public void apply(StatusPackage pkg) {
    StatusEvent event = repository.findByDocumentAndSender(pkg.documentId(), pkg.senderCode());
    if (!event.getStatus().canMoveTo(pkg.status())) {
        return;                                   // bỏ qua, không lùi trạng thái
    }
    event.setStatus(pkg.status());
    repository.saveAndFlush(event);               // @Version: xung đột thì ném lỗi, không ghi đè
    afterCommit(() -> axisClient.confirmDone(pkg.id()));
}`,
  },
  {
    file: 'InboundResultGuard.java',
    caption: { vi: 'Chỉ nhận kết quả mà chính mình đã gửi đi.', en: 'Only accept results for messages we actually sent.' },
    code: `// Bản tin quay về phải khớp một dòng outbound của chính eDLM
public boolean owns(InboundResult result) {
    return documentRepository.existsById(result.documentId())
        && outboundRepository.existsByDocumentIdAndKey(result.documentId(), result.key());
}`,
  },
];
