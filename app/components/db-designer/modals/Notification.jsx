export default function Notification({ message, type = "info" }) {
    if (!message) return null;
  
    const colors = {
      info: "bg-blue-600",
      success: "bg-green-600",
      warning: "bg-yellow-600",
      error: "bg-red-600",
    };
  
    return (
      <div
        className={`fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`}
      >
        {message}
      </div>
    );
  }
  