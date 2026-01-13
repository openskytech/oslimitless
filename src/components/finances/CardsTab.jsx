import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard, Eye, EyeOff } from 'lucide-react';
import CardDialog from './CardDialog';

export default function CardsTab({ workspaceId }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [revealedCards, setRevealedCards] = useState({});
  const queryClient = useQueryClient();

  const { data: cards = [] } = useQuery({
    queryKey: ['cards', workspaceId],
    queryFn: () => base44.entities.CompanyCard.filter({ workspace_id: workspaceId })
  });

  const cardTypeColors = {
    credit: 'bg-gradient-to-r from-purple-500 to-indigo-600',
    debit: 'bg-gradient-to-r from-blue-500 to-cyan-600',
    virtual: 'bg-gradient-to-r from-gray-600 to-gray-800'
  };

  const toggleReveal = (cardId) => {
    setRevealedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Company Cards</h2>
        <Button onClick={() => { setEditingCard(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Card
        </Button>
      </div>

      {cards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No cards yet. Add company credit/debit cards for secure tracking.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(card => (
            <Card key={card.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-48 p-6 text-white relative ${cardTypeColors[card.card_type]}`}>
                <div className="flex justify-between items-start mb-8">
                  <span className="text-sm font-medium opacity-90 uppercase">{card.card_type}</span>
                  <span className={`px-2 py-1 rounded text-xs ${card.is_active ? 'bg-white/20' : 'bg-red-500/50'}`}>
                    {card.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="mb-6">
                  <p className="text-xl tracking-wider mb-2">
                    {revealedCards[card.id] && card.full_card_number 
                      ? card.full_card_number.match(/.{1,4}/g).join(' ')
                      : `•••• •••• •••• ${card.last_four}`}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-75">Cardholder</p>
                    <p className="text-sm font-medium">{card.cardholder_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-75">Expires</p>
                    <p className="text-sm font-medium">{card.expiration_date}</p>
                  </div>
                </div>
              </div>

              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{card.card_name}</span>
                    <span className="font-medium text-gray-900">{card.bank_name}</span>
                  </div>
                  
                  {card.credit_limit && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Limit</span>
                      <span className="font-medium text-gray-900">${card.credit_limit.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleReveal(card.id)}
                    >
                      {revealedCards[card.id] ? (
                        <><EyeOff className="w-4 h-4 mr-2" /> Hide</>
                      ) : (
                        <><Eye className="w-4 h-4 mr-2" /> Reveal</>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => { setEditingCard(card); setDialogOpen(true); }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CardDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        card={editingCard}
        workspaceId={workspaceId}
        onSaved={() => {
          queryClient.invalidateQueries(['cards']);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}