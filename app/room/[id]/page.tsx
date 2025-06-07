// app/room/[id]/page.tsx
import RoomChat from '../../../components/RoomChat'

export default function RoomPage({ params }: { params: { id: string } }) {
  return <RoomChat roomId={params.id} />
}
