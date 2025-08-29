<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Separator } from '$lib/components/ui/separator';
  import { Textarea } from '$lib/components/ui/textarea';
  import { 
    BookOpen, 
    User, 
    Calendar, 
    MapPin, 
    Star,
    ArrowLeft,
    Send,
    MessageSquare,
    ThumbsUp,
    Heart
  } from 'lucide-svelte';

  export let data: any;
  
  let book = data.book;
  let reviews = data.reviews || [];
  let ratingSummary = data.ratingSummary;
  
  let userRating = 0;
  let reviewText = '';
  let isSubmitting = false;
  let showReviewForm = false;
  let isUpdating = false;

  onMount(() => {
    if (!book) {
      goto('/library/books');
    }
  });

  async function submitReview() {
    if (userRating === 0) {
      alert('Please select a rating');
      return;
    }

    isSubmitting = true;
    try {
      const response = await fetch(`/api/books/reviews/${book.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: userRating, reviewText })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Optimistically update the UI
        await updateReviewData();
        
        // Reset form
        userRating = 0;
        reviewText = '';
        showReviewForm = false;
        
        // Show success message
        alert('Review submitted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert('Error submitting review');
    } finally {
      isSubmitting = false;
    }
  }

  async function updateReviewData() {
    isUpdating = true;
    try {
      // Fetch updated reviews and rating summary in a single call
      const response = await fetch(`/api/books/reviews/${book.id}`);
      
      if (response.ok) {
        const data = await response.json();
        reviews = data.reviews || [];
        ratingSummary = data.ratingSummary;
      }
    } catch (error) {
      console.error('Error updating review data:', error);
    } finally {
      isUpdating = false;
    }
  }

  function getRatingStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }

  function getRatingColor(rating: number) {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  }

  function getRatingLabel(rating: number) {
    if (rating === 5) return 'Excellent';
    if (rating === 4) return 'Very Good';
    if (rating === 3) return 'Good';
    if (rating === 2) return 'Fair';
    if (rating === 1) return 'Poor';
    return '';
  }
</script>

<svelte:head>
  <title>{book?.title} - Reviews - UniVerse Library</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
  <!-- Header Section -->
  <div class="bg-white shadow-sm border-b">
    <div class="px-6 py-8 mx-auto max-w-7xl">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="flex items-center gap-4">
          <Button onclick={() => goto('/library/books')} variant="outline" class="p-2">
            <ArrowLeft class="w-4 h-4" />
          </Button>
          <div>
            <h1 class="text-3xl font-bold text-gray-900 sm:text-4xl">
              Book Reviews
            </h1>
            <p class="mt-2 text-lg text-gray-600">
              Read and write reviews for "{book?.title}"
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <Button onclick={() => goto('/library/books')} variant="outline" class="px-6 py-3">
            📚 Explore Books
          </Button>
          <div class="px-3 py-1 bg-blue-50 rounded-lg border border-blue-200">
            <span class="text-sm font-medium text-blue-700">
              Current: Book Reviews
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="px-6 py-8 mx-auto max-w-7xl">
    <!-- Book Information Card -->
    <Card class="mb-8 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardContent class="p-8">
        <div class="grid gap-8 md:grid-cols-2">
          <!-- Book Cover -->
          <div class="aspect-[3/4] bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center overflow-hidden">
            {#if book?.image_url}
              <img src={book.image_url} alt={book.title} class="w-full h-full object-cover" />
            {:else}
              <BookOpen class="w-24 h-24 text-blue-400" />
            {/if}
          </div>
          
          <!-- Book Details -->
          <div class="space-y-6">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 mb-3">{book?.title}</h2>
              <p class="text-xl text-gray-600 mb-4">by {book?.author}</p>
              
              <!-- Rating Summary -->
              {#if ratingSummary}
                <div class="flex items-center gap-4 mb-6">
                  <div class="flex items-center gap-2">
                    <div class="text-3xl font-bold {getRatingColor(ratingSummary.average_rating)}">
                      {ratingSummary.average_rating}
                    </div>
                    <div class="flex items-center gap-1">
                      {#each getRatingStars(Math.round(ratingSummary.average_rating)) as isFilled}
                        <Star class="w-6 h-6 {isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}" />
                      {/each}
                    </div>
                  </div>
                  <div class="text-gray-600">
                    <span class="font-medium">{ratingSummary.total_reviews}</span> reviews
                  </div>
                </div>
              {/if}
            </div>
            
            <!-- Book Metadata -->
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <BookOpen class="w-5 h-5 text-gray-400" />
                <span class="text-gray-600">ISBN:</span>
                <span class="font-medium">{book?.isbn}</span>
              </div>
              
              <div class="flex items-center gap-2">
                <MapPin class="w-5 h-5 text-gray-400" />
                <span class="text-gray-600">Category:</span>
                <Badge variant="secondary" class="text-xs">{book?.category}</Badge>
              </div>
              
              <div class="flex items-center gap-2">
                <Calendar class="w-5 h-5 text-gray-400" />
                <span class="text-gray-600">Published:</span>
                <span class="font-medium">{book?.published_year || 'N/A'}</span>
              </div>
              
              <div class="flex items-center gap-2">
                <MapPin class="w-5 h-5 text-gray-400" />
                <span class="text-gray-600">Location:</span>
                <span class="font-medium">{book?.location}</span>
              </div>
            </div>

            <!-- Write Review Button -->
            {#if !showReviewForm}
              <Button 
                onclick={() => showReviewForm = true} 
                class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 transition-all duration-300"
              >
                <MessageSquare class="w-4 h-4 mr-2" />
                {reviews.find((r: any) => r.user_email === data.user.email) ? 'Update Your Review' : 'Write a Review'}
              </Button>
            {/if}
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Review Form -->
    {#if showReviewForm}
      <Card class="mb-8 border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
        <CardHeader>
          <CardTitle class="text-xl text-gray-900">Share Your Thoughts</CardTitle>
          <CardDescription>
            Help other readers by sharing your experience with this book
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Rating Selection -->
          <div>
            <Label class="text-sm font-medium text-gray-700 mb-3 block">Your Rating</Label>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1">
                {#each Array.from({ length: 5 }, (_, i) => i + 1) as starValue}
                  <button
                    onclick={() => userRating = starValue}
                    class="transition-all duration-200 hover:scale-110"
                  >
                    <Star 
                      class="w-8 h-8 {starValue <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}" 
                    />
                  </button>
                {/each}
              </div>
              {#if userRating > 0}
                <div class="ml-4">
                  <span class="text-lg font-medium {getRatingColor(userRating)}">
                    {getRatingLabel(userRating)}
                  </span>
                </div>
              {/if}
            </div>
          </div>

          <!-- Review Text -->
          <div>
            <Label for="review" class="text-sm font-medium text-gray-700 mb-3 block">
              Your Review (Optional)
            </Label>
            <Textarea
              id="review"
              bind:value={reviewText}
              placeholder="Share your thoughts about this book..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <!-- Submit Button -->
          <Button 
            onclick={submitReview}
            disabled={isSubmitting || userRating === 0}
            class="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white border-0 transition-all duration-300 disabled:opacity-50"
          >
            <Send class="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </CardContent>
      </Card>
    {/if}

    <!-- Reviews Section -->
    <Card class="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div>
              <CardTitle class="text-2xl text-gray-900">Reader Reviews</CardTitle>
              <CardDescription>
                {reviews.length} review{reviews.length !== 1 ? 's' : ''} from our community
              </CardDescription>
            </div>
            {#if isUpdating}
              <div class="flex items-center gap-2 text-blue-600">
                <div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span class="text-sm">Updating...</span>
              </div>
            {:else}
              <Button 
                onclick={updateReviewData} 
                variant="outline" 
                size="sm"
                class="text-xs"
              >
                <div class="w-3 h-3 mr-1">↻</div>
                Refresh
              </Button>
            {/if}
          </div>
          
          {#if ratingSummary}
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900">{ratingSummary.average_rating}</div>
              <div class="text-sm text-gray-600">Average Rating</div>
            </div>
          {/if}
        </div>
      </CardHeader>
      
      <CardContent>
        {#if reviews.length === 0}
          <div class="text-center py-16">
            <MessageSquare class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p class="text-gray-600 mb-6">Be the first to share your thoughts about this book!</p>
            <Button onclick={() => showReviewForm = true} class="px-6 py-3">
              Write First Review
            </Button>
          </div>
        {:else}
          <div class="space-y-6">
            {#each reviews as review}
              <div class="border-b border-gray-200 pb-6 last:border-b-0">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {review.user_email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">
                        {review.user_email || 'Anonymous User'}
                      </div>
                      <div class="text-sm text-gray-500">
                        {new Date(review.review_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-1">
                    {#each getRatingStars(review.rating) as isFilled}
                      <Star class="w-5 h-5 {isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}" />
                    {/each}
                  </div>
                </div>
                
                {#if review.review_text}
                  <p class="text-gray-700 leading-relaxed">{review.review_text}</p>
                {/if}
                
                <div class="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <button class="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <ThumbsUp class="w-4 h-4" />
                    Helpful
                  </button>
                  <button class="flex items-center gap-1 hover:text-red-600 transition-colors">
                    <Heart class="w-4 h-4" />
                    Like
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </CardContent>
    </Card>


  </div>
</div>
