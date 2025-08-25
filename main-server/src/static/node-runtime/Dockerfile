FROM node:20-slim

# Create non-root user with fixed UID/GID
# (Pick 1000:1000 because most Linux hosts have their first user with UID/GID 1000)
RUN useradd --create-home --shell /bin/bash appuser


# Create working directory
WORKDIR /app

# Ensure ownership and permissions
RUN chown -R appuser:appuser /app && chmod 755 /app

# Switch to non-root user
USER appuser

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000
SHELL ["/bin/bash", "-lc"]
CMD ["bash", "-lc", "trap : TERM INT; sleep infinity & wait"]
