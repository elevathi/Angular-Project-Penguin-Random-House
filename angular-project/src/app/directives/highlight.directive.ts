import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
  @Input() appHighlight = '#f0f0f0';
  @Input() highlightTextColor = '#000';

  private originalBackground = '';
  private originalColor = '';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.originalBackground = this.el.nativeElement.style.backgroundColor;
    this.originalColor = this.el.nativeElement.style.color;
    this.highlight(this.appHighlight, this.highlightTextColor);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight(this.originalBackground, this.originalColor);
  }

  private highlight(bgColor: string, textColor: string) {
    this.el.nativeElement.style.backgroundColor = bgColor;
    this.el.nativeElement.style.color = textColor;
    this.el.nativeElement.style.transition = 'all 0.3s ease';
  }
}