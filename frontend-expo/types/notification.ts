export type NotificationType =
  | "like"
  | "comment"
  | "follow"
  | "message"
  | "system";

export type Notification = {
  id: string;
  recipient_id: string;
  actor_id?: string | null;
  type: NotificationType | string;
  title: string;
  body: string;
  reference_id?: string | null;
  reference_type?: string | null;
  read: boolean;
  created_at: string;
};