
export enum MessageAuthor {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatMessage {
  author: MessageAuthor;
  text: string;
}
