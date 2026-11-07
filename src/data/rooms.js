import room2 from "../assets/rooms/room-2.jpg";
import room3 from "../assets/rooms/room-3.jpg";
import room4 from "../assets/rooms/room-4.jpg";

// Prices are stored in Indonesian Rupiah and converted for display.
export const ROOMS = [
  {
    id: "standard",
    image: room3,
    price: 1200000,
    guests: "2",
    size: "24 m²",
    titleKey: "stay.rooms.standard.title",
    descriptionKey: "stay.rooms.standard.description",
  },
  {
    id: "deluxe",
    image: room4,
    price: 1800000,
    guests: "2-3",
    size: "32 m²",
    titleKey: "stay.rooms.deluxe.title",
    descriptionKey: "stay.rooms.deluxe.description",
  },
  {
    id: "family",
    image: room2,
    price: 2750000,
    guests: "4-5",
    size: "48 m²",
    titleKey: "stay.rooms.family.title",
    descriptionKey: "stay.rooms.family.description",
  },
];
