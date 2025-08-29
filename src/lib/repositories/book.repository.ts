import { supabase } from '$lib/supabase';
import type { Book } from '$lib/types/book';

export class BookRepository {
	async getAllBooks(): Promise<Book[]> {
		const { data, error } = await supabase
			.from('books')
			.select(
				`
				id, 
				title, 
				author, 
				isbn, 
				status, 
				category, 
				published_year, 
				location, 
				image_url, 
				created_at,
				book_copies (
					id,
					status,
					is_available
				)
			`
			)
			.order('title');

		if (error) {
			throw new Error(`Failed to fetch books: ${error.message}`);
		}

		// Transform the data to include copy counts
		return (data || []).map((book) => {
			const totalCopies = book.book_copies?.length || 0;
			const availableCopies =
				book.book_copies?.filter((copy) => copy.status === 'available')?.length || 0;
			const borrowedCopies =
				book.book_copies?.filter((copy) => copy.status === 'borrowed')?.length || 0;
			const reservedCopies =
				book.book_copies?.filter((copy) => copy.status === 'reserved')?.length || 0;

			return {
				...book,
				totalCopies,
				availableCopies,
				borrowedCopies,
				reservedCopies
			};
		});
	}

	async getBookById(id: string): Promise<Book | null> {
		const { data, error } = await supabase
			.from('books')
			.select(
				`
				id, 
				title, 
				author, 
				isbn, 
				status, 
				category, 
				published_year, 
				location, 
				image_url, 
				created_at,
				book_copies (
					id,
					status,
					is_available
				)
			`
			)
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				return null; // No rows returned
			}
			throw new Error(`Failed to fetch book: ${error.message}`);
		}

		// Transform the data to include copy counts
		const totalCopies = data.book_copies?.length || 0;
		const availableCopies =
			data.book_copies?.filter((copy) => copy.status === 'available')?.length || 0;
		const borrowedCopies =
			data.book_copies?.filter((copy) => copy.status === 'borrowed')?.length || 0;
		const reservedCopies =
			data.book_copies?.filter((copy) => copy.status === 'reserved')?.length || 0;

		return {
			...data,
			totalCopies,
			availableCopies,
			borrowedCopies,
			reservedCopies
		};
	}

	async searchBooks(query: string): Promise<Book[]> {
		const { data, error } = await supabase
			.from('books')
			.select(
				`
				id, 
				title, 
				author, 
				isbn, 
				status, 
				category, 
				published_year, 
				location, 
				image_url, 
				created_at,
				book_copies (
					id,
					status,
					is_available
				)
			`
			)
			.or(`title.ilike.%${query}%,author.ilike.%${query}%`)
			.order('title');

		if (error) {
			throw new Error(`Failed to fetch books: ${error.message}`);
		}

		// Transform the data to include copy counts
		return (data || []).map((book) => {
			const totalCopies = book.book_copies?.length || 0;
			const availableCopies =
				book.book_copies?.filter((copy) => copy.status === 'available')?.length || 0;
			const borrowedCopies =
				book.book_copies?.filter((copy) => copy.status === 'borrowed')?.length || 0;
			const reservedCopies =
				book.book_copies?.filter((copy) => copy.status === 'reserved')?.length || 0;

			return {
				...book,
				totalCopies,
				availableCopies,
				borrowedCopies,
				reservedCopies
			};
		});
	}

	async getBooksByStatus(status: Book['status']): Promise<Book[]> {
		const { data, error } = await supabase
			.from('books')
			.select(
				`
				id, 
				title, 
				author, 
				isbn, 
				status, 
				category, 
				published_year, 
				location, 
				image_url, 
				created_at,
				book_copies (
					id,
					status,
					is_available
				)
			`
			)
			.eq('status', status)
			.order('title');

		if (error) {
			throw new Error(`Failed to fetch books by status: ${error.message}`);
		}

		// Transform the data to include copy counts
		return (data || []).map((book) => {
			const totalCopies = book.book_copies?.length || 0;
			const availableCopies =
				book.book_copies?.filter((copy) => copy.status === 'available')?.length || 0;
			const borrowedCopies =
				book.book_copies?.filter((copy) => copy.status === 'borrowed')?.length || 0;
			const reservedCopies =
				book.book_copies?.filter((copy) => copy.status === 'reserved')?.length || 0;

			return {
				...book,
				totalCopies,
				availableCopies,
				borrowedCopies,
				reservedCopies
			};
		});
	}
}
