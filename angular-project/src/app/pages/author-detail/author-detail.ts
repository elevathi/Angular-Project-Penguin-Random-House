import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PrhApiService } from '../../services/prh-api.service';
import { Author } from '../../models/author.model';
import { Title } from '../../models/title.model';
import { LoaderComponent } from '../../components/loader/loader.component';
import { TitleCardComponent } from '../../components/title-card/title-card.component';
import { HighlightDirective } from '../../directives/highlight.directive';

@Component({
  selector: 'app-author-detail',
  standalone: true,
  imports: [CommonModule, LoaderComponent, TitleCardComponent, HighlightDirective],
  templateUrl: './author-detail.html',
  styleUrl:'author-detail.css'
})
export class AuthorDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private prhApiService = inject(PrhApiService);
  private sanitizer = inject(DomSanitizer);

  author: Author | null = null;
  sanitizedSpotlight: SafeHtml | null = null;
  authorTitles: Title[] = [];
  
  isLoading = false;
  isLoadingTitles = false;
  errorMessage = '';

  ngOnInit(): void {
    const authorId = this.route.snapshot.paramMap.get('authorid');
    if (authorId) {
      this.loadAuthor(authorId);
    }
  }

  loadAuthor(authorId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.prhApiService.getAuthorById(authorId).subscribe({
      next: (author) => {
        this.author = author;
        // Sanitize HTML content to prevent XSS
        if (author.spotlight) {
          this.sanitizedSpotlight = this.sanitizer.bypassSecurityTrustHtml(author.spotlight);
        }
        this.isLoading = false;
        this.loadAuthorTitles(authorId);
      },
      error: (err) => {
        console.error('Error loading author:', err);
        this.errorMessage = 'Napaka pri nalaganju avtorja.';
        this.isLoading = false;
      }
    });
  }

  loadAuthorTitles(authorId: string): void {
    this.isLoadingTitles = true;

    this.prhApiService.getTitlesByAuthor(authorId).subscribe({
      next: (response) => {
        if (response.title) {
          this.authorTitles = Array.isArray(response.title) 
            ? response.title 
            : [response.title];
        }
        this.isLoadingTitles = false;
      },
      error: (err) => {
        console.error('Error loading titles:', err);
        this.isLoadingTitles = false;
      }
    });
  }

  onTitleSelected(title: Title): void {
    this.router.navigate(['/title', title.isbn]);
  }

  goBack(): void {
    this.router.navigate(['/search']);
  }
}