import avatar1 from "../assets/reviews/avatar-1.jpg";
import avatar2 from "../assets/reviews/avatar-2.jpg";
import avatar3 from "../assets/reviews/avatar-3.jpg";
import avatar4 from "../assets/reviews/avatar-4.jpg";
import avatar5 from "../assets/reviews/avatar-5.jpg";
import avatar6 from "../assets/reviews/avatar-6.jpg";
import avatar7 from "../assets/reviews/avatar-7.jpg";

// Names stay in Latin script; quotes and locations live in the locale files.
export const REVIEWS = [
  { id: "daniel", name: "Daniel Kim", avatar: avatar1 },
  { id: "sofia", name: "Sofia Rossi", avatar: avatar2 },
  { id: "lucas", name: "Lucas Meyer", avatar: avatar3 },
  { id: "emily", name: "Emily Carter", avatar: avatar4 },
  { id: "aisha", name: "Aisha Rahman", avatar: avatar5 },
  { id: "yuki", name: "Yuki Tanaka", avatar: avatar6 },
  { id: "marcus", name: "Marcus Reid", avatar: avatar7 },
];

// Emily is highlighted on first paint, matching the reference layout.
export const DEFAULT_REVIEW_INDEX = 3;
