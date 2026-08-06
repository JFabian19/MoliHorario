import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, ShieldCheck, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { ProfessorReview } from '../../types/academic';
import { APP_CONFIG, ProfessorTag } from '../../config/appConfig';

interface ProfessorReviewsModalProps {
  isOpen: boolean;
  professorKey: string | null;
  professorName: string | null;
  courseCode?: string;
  courseName?: string;
  onClose: () => void;
}

export const ProfessorReviewsModal: React.FC<ProfessorReviewsModalProps> = ({
  isOpen,
  professorKey,
  professorName,
  courseCode,
  courseName,
  onClose
}) => {
  const [reviews, setReviews] = useState<ProfessorReview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSubmitForm, setShowSubmitForm] = useState<boolean>(false);

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<ProfessorTag[]>([]);
  const [acceptRules, setAcceptRules] = useState<boolean>(false);
  const [honeypot, setHoneypot] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && professorKey) {
      fetchReviews();
    }
  }, [isOpen, professorKey]);

  const fetchReviews = async () => {
    if (!professorKey) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews?professor_key=${encodeURIComponent(professorKey)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        setReviews([]);
      }
    } catch (e) {
      console.error("Failed to fetch reviews:", e);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !professorName) return null;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';

  const toggleTag = (tag: ProfessorTag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length < 3) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptRules) return;
    setIsSubmitting(true);
    setSubmitStatus(null);

    const payload = {
      professor_key: professorKey,
      professor_name: professorName,
      course_code: courseCode || 'GENERIC',
      course_name: courseName || '',
      period: APP_CONFIG.academicPeriodDefault,
      rating: rating,
      tags: selectedTags,
      comment: '', // Comment field removed as per request
      website: honeypot,
      turnstileToken: 'mock-client-token'
    };

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setSubmitStatus({
          type: 'success',
          msg: data.message || 'Reseña enviada correctamente. Se publicará tras ser revisada por moderación.'
        });
        setSelectedTags([]);
        setShowSubmitForm(false);
      } else {
        setSubmitStatus({
          type: 'error',
          msg: data.message || 'Ocurrió un error al enviar la reseña.'
        });
      }
    } catch (err: any) {
      setSubmitStatus({
        type: 'error',
        msg: 'Error de red al conectar con el servidor de reseñas.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 flex-shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                Docente UNALM
              </span>
              <span className="text-xs text-slate-500 font-medium">Reseñas</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">{professorName}</h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rating Summary Bar */}
        <div className="my-3.5 bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="text-3xl font-black text-purple-900">{avgRating}</div>
            <div>
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      Number(avgRating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500">{reviews.length} valoraciones aprobadas</span>
            </div>
          </div>

          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{showSubmitForm ? 'Ver Reseñas' : 'Evaluar'}</span>
          </button>
        </div>

        {/* Status Message */}
        {submitStatus && (
          <div className={`p-3 rounded-xl text-xs mb-3 flex items-center space-x-2 ${
            submitStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {submitStatus.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{submitStatus.msg}</span>
          </div>
        )}

        {/* Form OR Reviews List */}
        {showSubmitForm ? (
          <form onSubmit={handleSubmitReview} className="overflow-y-auto flex-grow space-y-4 pr-1 custom-scrollbar my-2">
            {/* Honeypot field */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              autoComplete="off"
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Calificación general (1 a 5 estrellas)</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Características destacadas (máximo 3)</label>
              <div className="flex flex-wrap gap-1.5">
                {APP_CONFIG.tags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-purple-700 text-white border-purple-700 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 text-slate-600">
              <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span>Reglas de Evaluación</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Todas las valoraciones están sujetas a moderación previa antes de publicarse.
              </p>
              <label className="flex items-center space-x-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptRules}
                  onChange={(e) => setAcceptRules(e.target.checked)}
                  className="rounded text-purple-700 focus:ring-purple-700"
                />
                <span className="font-semibold text-slate-800">Acepto las reglas de evaluación</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!acceptRules || isSubmitting}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Enviando...' : 'Enviar Evaluación'}</span>
            </button>
          </form>
        ) : (
          /* Reviews List */
          <div className="overflow-y-auto flex-grow space-y-2.5 pr-1 custom-scrollbar my-2">
            {isLoading ? (
              <p className="text-center py-12 text-slate-400 text-xs">Cargando reseñas de docentes...</p>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 text-sm">Aún no hay valoraciones aprobadas</p>
                <p className="text-xs text-slate-400 mt-1">Sé el primero en calificar la enseñanza del docente.</p>
              </div>
            ) : (
              reviews.map(rev => (
                <div key={rev.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            rev.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">{rev.period} • {new Date(rev.created_at).toLocaleDateString()}</span>
                  </div>

                  {rev.tags && rev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rev.tags.map((t, idx) => (
                        <span key={idx} className="bg-purple-100 text-purple-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};
