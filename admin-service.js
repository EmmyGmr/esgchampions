// Admin Service Layer for Supabase
// Handles admin-specific operations for review management

const AdminService = {
  /**
   * Check if current user is admin
   */
  async isAdmin() {
    try {
      const champion = await SupabaseService.getCurrentChampion();
      if (!champion) return false;
      
      // Check if is_admin column exists, fallback to false if it doesn't
      if (champion.hasOwnProperty('is_admin')) {
        return champion.is_admin === true;
      } else {
        console.warn('is_admin column not found in champions table. Run supabase-admin-schema.sql to add admin support.');
        return false;
      }
    } catch (error) {
      console.error('Check admin error:', error);
      // If error is about column not existing, return false gracefully
      if (error.message && error.message.includes('does not exist')) {
        console.warn('Admin column not found. Please run the admin schema SQL.');
      }
      return false;
    }
  },

  /**
   * Get all reviews with related data (champion, indicator, panel)
   */
  async getAllReviews(filters = {}) {
    try {
      let query = supabaseClient
        .from('reviews')
        .select(`
          *,
          champions:champion_id (
            id,
            first_name,
            last_name,
            email,
            organization
          ),
          indicators:indicator_id (
            id,
            title,
            panel_id,
            description
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get panel information for each review
      const reviewsWithPanels = await Promise.all(
        (data || []).map(async (review) => {
          if (review.indicators && review.indicators.panel_id) {
            const panel = await SupabaseService.getPanel(review.indicators.panel_id);
            return {
              ...review,
              panel: panel
            };
          }
          return review;
        })
      );

      // Apply additional filters
      let filtered = reviewsWithPanels;

      if (filters.panelCategory && filters.panelCategory !== 'all') {
        filtered = filtered.filter(r => 
          r.panel && r.panel.category === filters.panelCategory
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(r => {
          const championName = r.champions 
            ? `${r.champions.first_name} ${r.champions.last_name}`.toLowerCase()
            : '';
          const indicatorTitle = r.indicators?.title?.toLowerCase() || '';
          const panelTitle = r.panel?.title?.toLowerCase() || '';
          
          return championName.includes(searchLower) ||
                 indicatorTitle.includes(searchLower) ||
                 panelTitle.includes(searchLower);
        });
      }

      return filtered;
    } catch (error) {
      console.error('Get all reviews error:', error);
      return [];
    }
  },

  /**
   * Get review statistics
   */
  async getReviewStats() {
    try {
      const { data, error } = await supabaseClient
        .from('reviews')
        .select('status');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        pending: 0,
        accepted: 0,
        deleted: 0
      };

      (data || []).forEach(review => {
        if (review.status === 'pending') stats.pending++;
        else if (review.status === 'accepted') stats.accepted++;
        else if (review.status === 'deleted') stats.deleted++;
      });

      return stats;
    } catch (error) {
      console.error('Get review stats error:', error);
      return { total: 0, pending: 0, accepted: 0, deleted: 0 };
    }
  },

  /**
   * Accept a review
   */
  async acceptReview(reviewId, notes = null) {
    try {
      const user = await SupabaseService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user is admin
      const isAdmin = await this.isAdmin();
      if (!isAdmin) throw new Error('Unauthorized: Admin access required');

      // Call the database function
      const { data, error } = await supabaseClient.rpc('accept_review', {
        p_review_id: reviewId,
        p_admin_id: user.id
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Accept review error:', error);
      throw error;
    }
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId, notes = null) {
    try {
      const user = await SupabaseService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user is admin
      const isAdmin = await this.isAdmin();
      if (!isAdmin) throw new Error('Unauthorized: Admin access required');

      // Call the database function
      const { data, error } = await supabaseClient.rpc('delete_review', {
        p_review_id: reviewId,
        p_admin_id: user.id,
        p_notes: notes
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Delete review error:', error);
      throw error;
    }
  },

  /**
   * Get accepted reviews for ranking page
   */
  async getAcceptedReviews(panelId = null, indicatorId = null) {
    try {
      let query = supabaseClient
        .from('accepted_reviews')
        .select(`
          *,
          champions:champion_id (
            id,
            first_name,
            last_name,
            organization
          ),
          indicators:indicator_id (
            id,
            title,
            description
          ),
          panels:panel_id (
            id,
            title,
            category,
            icon
          )
        `)
        .order('accepted_at', { ascending: false });

      if (panelId) {
        query = query.eq('panel_id', panelId);
      }

      if (indicatorId) {
        query = query.eq('indicator_id', indicatorId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get accepted reviews error:', error);
      return [];
    }
  },

  /**
   * Get admin action history
   */
  async getAdminActions(limit = 50) {
    try {
      const { data, error } = await supabaseClient
        .from('admin_actions')
        .select(`
          *,
          admin:admin_id (
            first_name,
            last_name
          ),
          reviews:review_id (
            id,
            indicator_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get admin actions error:', error);
      return [];
    }
  }
};

