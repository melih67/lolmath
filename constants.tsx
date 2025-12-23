import React from 'react';
import { Sword, Shield, Crosshair, Zap, Heart } from 'lucide-react';

export const ROLES = [
  { id: 'top', label: 'Top Lane', icon: <Shield className="w-4 h-4" /> },
  { id: 'jungle', label: 'Jungle', icon: <Zap className="w-4 h-4" /> },
  { id: 'mid', label: 'Mid Lane', icon: <Crosshair className="w-4 h-4" /> },
  { id: 'bot', label: 'Bot (ADC)', icon: <Sword className="w-4 h-4" /> },
  { id: 'support', label: 'Support', icon: <Heart className="w-4 h-4" /> },
];
