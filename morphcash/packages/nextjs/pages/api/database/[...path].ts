/**
 * Database API Mock
 * Provides a mock backend API for development and testing
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { User, VirtualCard, Transaction, PaymentMethod, Session } from '~~/services/database/types';

// In-memory storage for development
const users = new Map<string, User>();
const virtualCards = new Map<string, VirtualCard>();
const transactions = new Map<string, Transaction>();
const paymentMethods = new Map<string, PaymentMethod>();
const sessions = new Map<string, Session>();

// Helper functions
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const { path } = req.query;
  const pathArray = Array.isArray(path) ? path : [path];
  const endpoint = `/${pathArray.join('/')}`;

  try {
    switch (req.method) {
      case 'GET':
        return handleGet(endpoint, req, res);
      case 'POST':
        return handlePost(endpoint, req, res);
      case 'PUT':
        return handlePut(endpoint, req, res);
      case 'DELETE':
        return handleDelete(endpoint, req, res);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
};

const handleGet = async (endpoint: string, req: NextApiRequest, res: NextApiResponse) => {
  if (endpoint.startsWith('/users/')) {
    const userId = endpoint.split('/')[2];
    
    if (endpoint.includes('/stats')) {
      // User stats
      const userCards = Array.from(virtualCards.values()).filter(card => card.userId === userId);
      const userTransactions = Array.from(transactions.values()).filter(tx => tx.userId === userId);
      
      const totalSpent = userTransactions
        .filter(tx => tx.status === 'completed')
        .reduce((sum, tx) => sum + Number(tx.amount), 0);
      
      const lastTransaction = userTransactions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      
      return res.json({
        success: true,
        data: {
          totalCards: userCards.length,
          activeCards: userCards.filter(card => card.isActive).length,
          totalTransactions: userTransactions.length,
          totalSpent: BigInt(totalSpent),
          lastTransactionAt: lastTransaction?.createdAt,
        }
      });
    }
    
    if (endpoint.includes('/address/')) {
      const address = endpoint.split('/address/')[1];
      const user = Array.from(users.values()).find(u => u.address === address);
      return res.json({ success: true, data: user || null });
    }
    
    if (endpoint.includes('/ens/')) {
      const ensName = endpoint.split('/ens/')[1];
      const user = Array.from(users.values()).find(u => u.ensName === ensName);
      return res.json({ success: true, data: user || null });
    }
    
    if (endpoint.includes('/email/')) {
      const email = endpoint.split('/email/')[1];
      const user = Array.from(users.values()).find(u => u.email === email);
      return res.json({ success: true, data: user || null });
    }
    
    // Get user by ID
    const user = users.get(userId);
    return res.json({ success: true, data: user || null });
  }
  
  if (endpoint.startsWith('/virtual-cards')) {
    const userId = req.query.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const userCards = Array.from(virtualCards.values())
      .filter(card => card.userId === userId)
      .slice((page - 1) * limit, page * limit);
    
    return res.json({
      success: true,
      data: userCards,
      pagination: {
        page,
        limit,
        total: Array.from(virtualCards.values()).filter(card => card.userId === userId).length,
        totalPages: Math.ceil(Array.from(virtualCards.values()).filter(card => card.userId === userId).length / limit),
      }
    });
  }
  
  if (endpoint.startsWith('/transactions')) {
    const userId = req.query.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const userTransactions = Array.from(transactions.values())
      .filter(tx => tx.userId === userId)
      .slice((page - 1) * limit, page * limit);
    
    return res.json({
      success: true,
      data: userTransactions,
      pagination: {
        page,
        limit,
        total: Array.from(transactions.values()).filter(tx => tx.userId === userId).length,
        totalPages: Math.ceil(Array.from(transactions.values()).filter(tx => tx.userId === userId).length / limit),
      }
    });
  }
  
  if (endpoint.startsWith('/payment-methods')) {
    const userId = req.query.userId as string;
    const userPaymentMethods = Array.from(paymentMethods.values())
      .filter(pm => pm.userId === userId);
    
    return res.json({ success: true, data: userPaymentMethods });
  }
  
  if (endpoint.startsWith('/sessions/')) {
    const sessionId = endpoint.split('/')[2];
    const session = sessions.get(sessionId);
    return res.json({ success: true, data: session || null });
  }
  
  return res.status(404).json({ success: false, error: 'Endpoint not found' });
};

const handlePost = async (endpoint: string, req: NextApiRequest, res: NextApiResponse) => {
  if (endpoint === '/users') {
    const userData = req.body;
    const user: User = {
      ...userData,
      id: generateId('user'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    users.set(user.id, user);
    return res.json({ success: true, data: user });
  }
  
  if (endpoint === '/virtual-cards') {
    const cardData = req.body;
    const card: VirtualCard = {
      ...cardData,
      id: generateId('card'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    virtualCards.set(card.id, card);
    return res.json({ success: true, data: card });
  }
  
  if (endpoint === '/transactions') {
    const transactionData = req.body;
    const transaction: Transaction = {
      ...transactionData,
      id: generateId('tx'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    transactions.set(transaction.id, transaction);
    return res.json({ success: true, data: transaction });
  }
  
  if (endpoint === '/payment-methods') {
    const paymentData = req.body;
    const payment: PaymentMethod = {
      ...paymentData,
      id: generateId('pm'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    paymentMethods.set(payment.id, payment);
    return res.json({ success: true, data: payment });
  }
  
  if (endpoint === '/sessions') {
    const sessionData = req.body;
    const session: Session = {
      ...sessionData,
      id: generateId('session'),
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    };
    
    sessions.set(session.id, session);
    return res.json({ success: true, data: session });
  }
  
  return res.status(404).json({ success: false, error: 'Endpoint not found' });
};

const handlePut = async (endpoint: string, req: NextApiRequest, res: NextApiResponse) => {
  if (endpoint.startsWith('/users/')) {
    const userId = endpoint.split('/')[2];
    const user = users.get(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const updatedUser = {
      ...user,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    
    users.set(userId, updatedUser);
    return res.json({ success: true, data: updatedUser });
  }
  
  if (endpoint.startsWith('/virtual-cards/')) {
    const cardId = endpoint.split('/')[2];
    const card = virtualCards.get(cardId);
    
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    
    const updatedCard = {
      ...card,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    
    virtualCards.set(cardId, updatedCard);
    return res.json({ success: true, data: updatedCard });
  }
  
  if (endpoint.startsWith('/transactions/')) {
    const transactionId = endpoint.split('/')[2];
    const transaction = transactions.get(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    
    const updatedTransaction = {
      ...transaction,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    
    transactions.set(transactionId, updatedTransaction);
    return res.json({ success: true, data: updatedTransaction });
  }
  
  if (endpoint.startsWith('/payment-methods/')) {
    const paymentId = endpoint.split('/')[2];
    const payment = paymentMethods.get(paymentId);
    
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment method not found' });
    }
    
    const updatedPayment = {
      ...payment,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    
    paymentMethods.set(paymentId, updatedPayment);
    return res.json({ success: true, data: updatedPayment });
  }
  
  if (endpoint.startsWith('/sessions/')) {
    const sessionId = endpoint.split('/')[2];
    const session = sessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    
    const updatedSession = {
      ...session,
      ...req.body,
    };
    
    sessions.set(sessionId, updatedSession);
    return res.json({ success: true, data: updatedSession });
  }
  
  return res.status(404).json({ success: false, error: 'Endpoint not found' });
};

const handleDelete = async (endpoint: string, req: NextApiRequest, res: NextApiResponse) => {
  if (endpoint.startsWith('/users/')) {
    const userId = endpoint.split('/')[2];
    users.delete(userId);
    return res.json({ success: true });
  }
  
  if (endpoint.startsWith('/virtual-cards/')) {
    const cardId = endpoint.split('/')[2];
    virtualCards.delete(cardId);
    return res.json({ success: true });
  }
  
  if (endpoint.startsWith('/payment-methods/')) {
    const paymentId = endpoint.split('/')[2];
    paymentMethods.delete(paymentId);
    return res.json({ success: true });
  }
  
  if (endpoint.startsWith('/sessions/')) {
    const sessionId = endpoint.split('/')[2];
    sessions.delete(sessionId);
    return res.json({ success: true });
  }
  
  return res.status(404).json({ success: false, error: 'Endpoint not found' });
};

export default handleRequest;
