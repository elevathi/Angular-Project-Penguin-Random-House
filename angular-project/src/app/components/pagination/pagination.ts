import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class PaginationComponent {
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  pageInput: string = '';
  showPageInput = false;

  get pageNumbers(): number[] {
    // Show limited page numbers for better UX with large page counts
    if (this.totalPages <= 7) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    const pages: number[] = [];
    const current = this.currentPage;
    const total = this.totalPages;

    // Always show first page
    pages.push(1);

    // Show pages around current page
    if (current > 3) {
      pages.push(-1); // Ellipsis marker
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Show ellipsis before last page if needed
    if (current < total - 2) {
      pages.push(-1); // Ellipsis marker
    }

    // Always show last page
    if (total > 1) {
      pages.push(total);
    }

    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  togglePageInput(): void {
    this.showPageInput = !this.showPageInput;
    if (this.showPageInput) {
      this.pageInput = this.currentPage.toString();
    }
  }

  goToPage(): void {
    const page = parseInt(this.pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= this.totalPages) {
      this.changePage(page);
      this.showPageInput = false;
    }
  }

  onPageInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.goToPage();
    } else if (event.key === 'Escape') {
      this.showPageInput = false;
    }
  }
}
