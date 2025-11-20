// Supabase Service Layer
// This replaces localStorage calls with Supabase API calls

// Make sure supabase-config.js is loaded before this file
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// <script src="supabase-config.js"></script>
// <script src="supabase-service.js"></script>

const SupabaseService = {
  // ============================================
  // AUTHENTICATION METHODS
  // ============================================

  /**
   * Sign up a new champion
   */
  async signUp(email, password, championData) {
    try {
      console.log('Starting sign up process for:', email);
      
      // 1. Create auth user
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: championData.firstName,
            last_name: championData.lastName
          }
        }
      });

      if (authError) {
        console.error('Auth sign up error:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error('No user returned from auth signup');
        throw new Error('Failed to create user account');
      }

      console.log('Auth user created:', authData.user.id);

      // Wait a moment for the trigger to potentially create the profile
      // (if trigger is set up, it will create a basic profile)
      await new Promise(resolve => setTimeout(resolve, 500));

      // 2. Create or update champion profile
      const insertData = {
        id: authData.user.id,
        first_name: championData.firstName,
        last_name: championData.lastName,
        organization: championData.organization || null,
        role: championData.role || null,
        email: email,
        mobile: championData.mobile || null,
        office_phone: championData.officePhone || null,
        linkedin: championData.linkedin || null,
        website: championData.website || null,
        competence: championData.competence || null,
        contributions: championData.contributions || null,
        primary_sector: championData.primarySector || null,
        expertise_panels: championData.expertisePanels || null,
        cla_accepted: championData.claAccepted || false,
        nda_accepted: championData.ndaAccepted || false,
        nda_signature: championData.ndaSignature || null,
        terms_accepted: championData.termsAccepted || false,
        ip_policy_accepted: championData.ipPolicyAccepted || false
      };

      console.log('Inserting/updating champion profile:', insertData);

      // Use upsert to handle case where trigger already created a basic profile
      const { data: championProfile, error: profileError } = await supabaseClient
        .from('champions')
        .upsert(insertData, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (profileError) {
        console.error('Champion profile insert/update error:', profileError);
        console.error('Error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        
        // If foreign key error, provide helpful message
        if (profileError.message && profileError.message.includes('foreign key')) {
          throw new Error('Registration failed: User account was not created properly. Please try again or contact support.');
        }
        
        throw new Error(`Failed to create champion profile: ${profileError.message}`);
      }

      console.log('Champion profile created/updated successfully:', championProfile);

      return { user: authData.user, champion: championProfile };
    } catch (error) {
      console.error('Sign up error:', error);
      // Provide more detailed error message
      const errorMessage = error.message || error.toString() || 'Registration failed';
      throw new Error(errorMessage);
    }
  },

  /**
   * Sign in a champion
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabaseClient.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  /**
   * Get current champion profile
   */
  async getCurrentChampion() {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        console.log('No authenticated user found');
        return null;
      }

      console.log('Fetching champion profile for user:', user.id);

      const { data, error } = await supabaseClient
        .from('champions')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching champion profile:', error);
        // If profile doesn't exist, return null
        if (error.code === 'PGRST116') {
          console.log('Champion profile not found in database');
          return null;
        }
        throw error;
      }

      if (!data) {
        console.log('No champion data returned');
        return null;
      }

      console.log('Champion profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Get current champion error:', error);
      return null;
    }
  },

  /**
   * Update champion profile
   */
  async updateChampion(championId, updates) {
    try {
      const { data, error } = await supabaseClient
        .from('champions')
        .update(updates)
        .eq('id', championId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update champion error:', error);
      throw error;
    }
  },

  // ============================================
  // PANELS METHODS
  // ============================================

  /**
   * Get all panels
   */
  async getPanels() {
    try {
      console.log('Fetching panels from Supabase...');
      const { data, error } = await supabaseClient
        .from('panels')
        .select('*')
        .order('id');

      if (error) {
        console.error('Get panels error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log('Panels fetched successfully:', data?.length || 0, 'panels');
      return data || [];
    } catch (error) {
      console.error('Get panels error:', error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      return [];
    }
  },

  /**
   * Get panel by ID
   */
  async getPanel(panelId) {
    try {
      const { data, error } = await supabaseClient
        .from('panels')
        .select('*')
        .eq('id', panelId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get panel error:', error);
      return null;
    }
  },

  /**
   * Initialize panels (seed data)
   */
  async initPanels(panelsData) {
    try {
      const { data, error } = await supabaseClient
        .from('panels')
        .upsert(panelsData, { onConflict: 'id' })
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Init panels error:', error);
      throw error;
    }
  },

  // ============================================
  // INDICATORS METHODS
  // ============================================

  /**
   * Get indicators for a panel
   */
  async getIndicators(panelId) {
    try {
      console.log('Fetching indicators for panel:', panelId);
      const { data, error } = await supabaseClient
        .from('indicators')
        .select('*')
        .eq('panel_id', panelId)
        .order('id');

      if (error) {
        console.error('Get indicators error:', error);
        throw error;
      }
      
      console.log('Indicators fetched successfully:', data?.length || 0, 'indicators');
      return data || [];
    } catch (error) {
      console.error('Get indicators error:', error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      return [];
    }
  },
    try {
      const { data, error } = await supabaseClient
        .from('indicators')
        .select('*')
        .eq('panel_id', panelId)
        .order('id');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get indicators error:', error);
      return [];
    }
  },

  /**
   * Get indicator by ID
   */
  async getIndicator(indicatorId) {
    try {
      const { data, error } = await supabaseClient
        .from('indicators')
        .select('*')
        .eq('id', indicatorId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get indicator error:', error);
      return null;
    }
  },

  /**
   * Initialize indicators (seed data)
   */
  async initIndicators(indicatorsData) {
    try {
      const { data, error } = await supabaseClient
        .from('indicators')
        .upsert(indicatorsData, { onConflict: 'id' })
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Init indicators error:', error);
      throw error;
    }
  },

  // ============================================
  // VOTES METHODS
  // ============================================

  /**
   * Save or update a vote
   */
  async saveVote(championId, indicatorId, vote) {
    try {
      const { data, error } = await supabaseClient
        .from('votes')
        .upsert({
          champion_id: championId,
          indicator_id: indicatorId,
          vote: vote
        }, {
          onConflict: 'champion_id,indicator_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Save vote error:', error);
      throw error;
    }
  },

  /**
   * Get votes for an indicator
   */
  async getVotes(indicatorId) {
    try {
      const { data, error } = await supabaseClient
        .from('votes')
        .select('*')
        .eq('indicator_id', indicatorId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get votes error:', error);
      return [];
    }
  },

  /**
   * Get vote by champion and indicator
   */
  async getChampionVote(championId, indicatorId) {
    try {
      const { data, error } = await supabaseClient
        .from('votes')
        .select('*')
        .eq('champion_id', championId)
        .eq('indicator_id', indicatorId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data || null;
    } catch (error) {
      console.error('Get champion vote error:', error);
      return null;
    }
  },

  // ============================================
  // COMMENTS METHODS
  // ============================================

  /**
   * Save a comment
   */
  async saveComment(championId, indicatorId, comment) {
    try {
      const { data, error } = await supabaseClient
        .from('comments')
        .insert({
          champion_id: championId,
          indicator_id: indicatorId,
          comment: comment
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Save comment error:', error);
      throw error;
    }
  },

  /**
   * Get comments for an indicator
   */
  async getComments(indicatorId) {
    try {
      const { data, error } = await supabaseClient
        .from('comments')
        .select(`
          *,
          champions:champion_id (
            first_name,
            last_name
          )
        `)
        .eq('indicator_id', indicatorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Format the response to match expected structure
      return (data || []).map(comment => ({
        id: comment.id,
        championId: comment.champion_id,
        championName: comment.champions 
          ? `${comment.champions.first_name} ${comment.champions.last_name}`
          : 'Anonymous',
        indicatorId: comment.indicator_id,
        comment: comment.comment,
        timestamp: comment.created_at
      }));
    } catch (error) {
      console.error('Get comments error:', error);
      return [];
    }
  },

  // ============================================
  // REVIEWS METHODS
  // ============================================

  /**
   * Save or update a review
   */
  async saveReview(championId, indicatorId, reviewData) {
    try {
      const { data, error } = await supabaseClient
        .from('reviews')
        .upsert({
          champion_id: championId,
          indicator_id: indicatorId,
          necessary: reviewData.necessary,
          rating: reviewData.rating,
          comments: reviewData.comments,
          status: reviewData.status || 'pending' // Default to pending for admin review
        }, {
          onConflict: 'champion_id,indicator_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Save review error:', error);
      throw error;
    }
  },

  /**
   * Get review by champion and indicator
   */
  async getReview(championId, indicatorId) {
    try {
      const { data, error } = await supabaseClient
        .from('reviews')
        .select('*')
        .eq('champion_id', championId)
        .eq('indicator_id', indicatorId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Get review error:', error);
      return null;
    }
  },

  /**
   * Get all reviews for an indicator
   */
  async getIndicatorReviews(indicatorId) {
    try {
      const { data, error } = await supabaseClient
        .from('reviews')
        .select('*')
        .eq('indicator_id', indicatorId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get indicator reviews error:', error);
      return [];
    }
  },

  // ============================================
  // INVITATIONS METHODS
  // ============================================

  /**
   * Save an invitation
   */
  async saveInvitation(fromChampionId, toEmail, panelId, message) {
    try {
      const { data, error } = await supabaseClient
        .from('invitations')
        .insert({
          from_champion_id: fromChampionId,
          to_email: toEmail,
          panel_id: panelId,
          message: message || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Save invitation error:', error);
      throw error;
    }
  },

  /**
   * Get invitations for a champion (by email)
   */
  async getInvitations(championEmail) {
    try {
      const { data, error } = await supabaseClient
        .from('invitations')
        .select('*')
        .eq('to_email', championEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get invitations error:', error);
      return [];
    }
  },

  // ============================================
  // PARTICIPATION & STATS METHODS
  // ============================================

  /**
   * Get participation history for a champion
   */
  async getParticipationHistory(championId) {
    try {
      // Get all votes and comments for this champion
      const [votesData, commentsData] = await Promise.all([
        supabaseClient
          .from('votes')
          .select('indicator_id, created_at')
          .eq('champion_id', championId),
        supabaseClient
          .from('comments')
          .select('indicator_id, created_at')
          .eq('champion_id', championId)
      ]);

      if (votesData.error) throw votesData.error;
      if (commentsData.error) throw commentsData.error;

      const votes = votesData.data || [];
      const comments = commentsData.data || [];

      // Get unique panel IDs from indicators
      const indicatorIds = [...new Set([
        ...votes.map(v => v.indicator_id),
        ...comments.map(c => c.indicator_id)
      ])];

      if (indicatorIds.length === 0) return [];

      // Get indicators to find panel IDs
      const { data: indicators, error: indicatorsError } = await supabaseClient
        .from('indicators')
        .select('id, panel_id')
        .in('id', indicatorIds);

      if (indicatorsError) throw indicatorsError;

      // Group by panel
      const panelMap = new Map();
      indicators.forEach(ind => {
        if (!panelMap.has(ind.panel_id)) {
          panelMap.set(ind.panel_id, {
            panelId: ind.panel_id,
            votes: [],
            comments: []
          });
        }
      });

      // Count votes and comments per panel
      votes.forEach(vote => {
        const indicator = indicators.find(i => i.id === vote.indicator_id);
        if (indicator && panelMap.has(indicator.panel_id)) {
          panelMap.get(indicator.panel_id).votes.push(vote);
        }
      });

      comments.forEach(comment => {
        const indicator = indicators.find(i => i.id === comment.indicator_id);
        if (indicator && panelMap.has(indicator.panel_id)) {
          panelMap.get(indicator.panel_id).comments.push(comment);
        }
      });

      // Get panel details
      const panelIds = Array.from(panelMap.keys());
      const { data: panels, error: panelsError } = await supabaseClient
        .from('panels')
        .select('*')
        .in('id', panelIds);

      if (panelsError) throw panelsError;

      // Format response
      return Array.from(panelMap.entries()).map(([panelId, data]) => {
        const panel = panels.find(p => p.id === panelId);
        const allActivities = [...data.votes, ...data.comments];
        const lastActivity = allActivities.length > 0
          ? allActivities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0].created_at
          : null;

        return {
          panel: panel,
          votesCount: data.votes.length,
          commentsCount: data.comments.length,
          lastActivity: lastActivity
        };
      }).sort((a, b) => {
        if (!a.lastActivity) return 1;
        if (!b.lastActivity) return -1;
        return new Date(b.lastActivity) - new Date(a.lastActivity);
      });
    } catch (error) {
      console.error('Get participation history error:', error);
      return [];
    }
  }
};

// Listen for auth state changes
supabaseClient.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.id);
  // You can dispatch custom events here if needed
  window.dispatchEvent(new CustomEvent('supabase:auth', { detail: { event, session } }));
});

