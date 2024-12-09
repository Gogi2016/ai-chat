import React from 'react';

const MessageBubble = ({ message }) => {
    const bubbleStyle = message.type === 'user'
        ? 'bg-blue-500 text-white ml-auto'
        : message.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-gray-200 text-gray-800';

    return (
        <div className={`rounded-lg p-3 max-w-[80%] mb-2 ${bubbleStyle}`}>
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.language && (
                <span className="text-xs opacity-75 mt-1 block">
                    Language: {message.language}
                </span>
            )}
        </div>
    );
};

export const ChatMessages = ({ messages }) => {
    return (
        <div className="flex flex-col space-y-4">
            {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
            ))}
        </div>
    );
}; 