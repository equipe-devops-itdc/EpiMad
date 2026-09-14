pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'epimad'
        DOCKER_BUILDKIT = '1'
        COMPOSE_DOCKER_CLI_BUILD = '1'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Nettoyage Pre-build') {
            steps {
                sh label: 'Clean Workspace Files', script: '''
                    rm -f "${WORKSPACE}/.env"
                '''
            }
        }

        stage('Génération Configuration') {
            steps {
                withCredentials([
                    string(credentialsId: 'POSTGRES_PORT_EPIMAD_ID', variable: 'CRED_POSTGRES_PORT'),
                    string(credentialsId: 'POSTGRES_USER_ID', variable: 'CRED_POSTGRES_USER'),
                    string(credentialsId: 'POSTGRES_PASSWORD_ID', variable: 'CRED_POSTGRES_PASSWORD'),
                    string(credentialsId: 'DOCKEROPT_ADMIN_EMAIL_ID', variable: 'CRED_ADMIN_EMAIL'),
                    string(credentialsId: 'DOCKEROPT_ADMIN_PASSWORD_ID', variable: 'CRED_ADMIN_PASSWORD')
                ]) {
                    sh label: 'Création du fichier .env', script: '''
                        cat <<EOF > "${WORKSPACE}/.env"
POSTGRES_HOST=db
POSTGRES_PORT=${CRED_POSTGRES_PORT:-5437}
POSTGRES_USER=${CRED_POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${CRED_POSTGRES_PASSWORD:-postgres}
POSTGRES_DB=epimad_db

DATABASE_URL=postgresql://${CRED_POSTGRES_USER:-postgres}:${CRED_POSTGRES_PASSWORD:-postgres}@db:5432/epimad_db

ADMIN_EMAIL=${CRED_ADMIN_EMAIL:-admin@epimad.com}
ADMIN_PASSWORD=${CRED_ADMIN_PASSWORD:-admin123}

# ---- FRONTEND (5173) ----
DOCKEROPT_FRONTEND_CONTAINER_NAME=epimad_frontend
FRONTEND_HOST_PORT=5173

# ---- BACKEND (8000) ----
DOCKEROPT_BACKEND_CONTAINER_NAME=epimad_backend
BACKEND_HOST_PORT=8000
EOF
                        chmod 600 "${WORKSPACE}/.env"
                    '''
                }
            }
        }

        stage('Validation Compose') {
            steps {
                sh label: 'Vérification syntaxe docker compose', script: '''
                    docker compose --env-file .env config
                '''
            }
        }

        stage('Build Images') {
            steps {
                sh label: 'Build des conteneurs', script: '''
                    docker compose --env-file .env build --no-cache
                '''
            }
        }

        stage('Deploy Services') {
            steps {
                sh label: 'Libération des ports avant déploiement', script: '''
                    for p in "5173" "8000" "5050" "5437"; do
                        cids=$(docker ps -aq --filter "publish=$p")
                        if [ -n "$cids" ]; then
                            echo "Nettoyage du conteneur occupant le port $p"
                            docker rm -f $cids || true
                        fi
                    done
                '''
                sh label: 'Démarrage des services', script: '''
                    docker compose --env-file .env up -d --force-recreate --remove-orphans
                '''
            }
        }

        stage('Database Migration') {
            steps {
                sh label: 'Exécution automatique de la migration SQL', script: '''
                    # Attente que PostgreSQL réponde sur le réseau
                    echo "Attente de l'initialisation de PostgreSQL..."
                    until docker exec epimad_postgres pg_isready -U postgres -d epimad_db; do
                        sleep 2
                    done

                    # Application du schéma ou script de migration si disponible
                    if [ -f "./database/schema.sql" ]; then
                        echo "Application du script database/schema.sql..."
                        docker exec -i epimad_postgres psql -U postgres -d epimad_db < ./database/schema.sql
                    else
                        echo "Aucun fichier schema.sql trouvé, passage de l'étape."
                    fi
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh label: 'Vérification de l\'état des conteneurs', script: '''
                    sleep 5
                    docker compose --env-file .env ps
                '''
            }
        }
    }

    post {
        failure {
            sh label: 'Récupération des logs en cas d\'erreur', script: '''
                if [ -f .env ]; then
                    docker compose --env-file .env logs --tail=100 || true
                fi
            '''
        }
    }
}