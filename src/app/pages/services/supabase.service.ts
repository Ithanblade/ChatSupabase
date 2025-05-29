import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabaseUrl = 'https://bqrqncmvnejoloedwthz.supabase.co';
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcnFuY212bmVqb2xvZWR3dGh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTkwMDksImV4cCI6MjA2NDAzNTAwOX0.8RCmq-9Pegv9GX3hvpuQLM6Qsi-4yN2M0mpvEHQ9YDc';
  public supabase: SupabaseClient;

  public currentUser = new BehaviorSubject<User | null>(null);
  private channel: any = null;

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.checkSession();
  }

  private async checkSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    this.currentUser.next(session?.user ?? null);

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser.next(session?.user ?? null);
    });
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
    this.currentUser.next(null);
  }

  async sendMessage(content: string) {
    const user = this.currentUser.value;
    if (!user) throw new Error('No hay usuario conectado');

    const { data, error } = await this.supabase
      .from('messages')
      .insert([{ user_id: user.id, content }]);
    if (error) throw error;
    return data;
  }

  listenMessages(callback: (message: any) => void) {
    if (this.channel) {
      this.channel.unsubscribe();
    }

    this.channel = this.supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  }

  unsubscribeMessages() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
  }
}
