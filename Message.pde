class Message {
  int displayedAt;
  String msg;
  
  Message(String _msg) {
   msg = _msg; 
  }
  
  boolean expired() {
   return false; 
  }
}

class MessageList {
  ArrayList<Message> messages = new ArrayList<Message>();
  int limit = 10;

  void run() {
    for (int i = limit-1; i >= 0; i--) {
      if (messages.get(i).expired()) { 
        messages.remove(i);
      }
    }
  }

  void addMessage(String msg) {
    messages.add(new Message(msg));
    if (messages.size() > 10) { 
      messages.remove(0);
    }
  }
}

