import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const TestSoundButton = () => {
    const { testSound, preferences, setPreferences } = useNotifications();
    const [showMenu, setShowMenu] = useState(false);

    const soundTypes = [
        { type: 'notification', label: 'Default', emoji: '🔔' },
        { type: 'newMessage', label: 'New Message', emoji: '📧' },
        { type: 'urgent', label: 'Urgent', emoji: '⚠️' },
        { type: 'success', label: 'Success', emoji: '✅' },
        { type: 'alert', label: 'Alert', emoji: '🔊' }
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
                <span>🔊 Test Sounds</span>
                <span>▼</span>
            </button>

            {showMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Sound Settings</h3>
                    
                    <div className="mb-3">
                        <label className="flex items-center justify-between text-sm">
                            <span>Enable Sounds</span>
                            <input
                                type="checkbox"
                                checked={preferences.sound_notifications}
                                onChange={(e) => setPreferences({
                                    ...preferences,
                                    sound_notifications: e.target.checked
                                })}
                                className="toggle"
                            />
                        </label>
                    </div>

                    <div className="mb-3">
                        <label className="text-sm text-gray-600 block mb-1">
                            Volume: {Math.round(preferences.volume * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={preferences.volume}
                            onChange={(e) => setPreferences({
                                ...preferences,
                                volume: parseFloat(e.target.value)
                            })}
                            className="w-full"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {soundTypes.map((sound) => (
                            <button
                                key={sound.type}
                                onClick={() => testSound(sound.type)}
                                disabled={!preferences.sound_notifications}
                                className="px-2 py-2 bg-gray-50 hover:bg-gray-100 rounded text-xs flex flex-col items-center gap-1 disabled:opacity-50"
                            >
                                <span className="text-lg">{sound.emoji}</span>
                                <span>{sound.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestSoundButton;