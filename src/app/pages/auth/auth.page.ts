import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from 'src/app/pages/services/supabase.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './auth.page.html',
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class AuthPage {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private supabase: SupabaseService, private router: Router) {}

  async login() {
    this.errorMessage = '';
    try {
      await this.supabase.signIn(this.email, this.password);
      this.router.navigate(['/chat']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Error en login';
    }
  }

  async register() {
    this.errorMessage = '';
    try {
      await this.supabase.signUp(this.email, this.password);
      alert('Revisa tu correo para confirmar el registro.');
    } catch (error: any) {
      this.errorMessage = error.message || 'Error en registro';
    }
  }
}
