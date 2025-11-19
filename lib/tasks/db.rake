namespace :db do
  desc "Drop all databases (SQLite and MongoDB)"
  task drop_all: :environment do
    puts "Dropping SQLite databases..."
    Rake::Task['db:drop'].invoke
    puts "Dropping MongoDB database..."
    Rake::Task['db:mongoid:drop'].invoke
    puts "✓ All databases dropped"
  end

  desc "Reset all databases (SQLite and MongoDB)"
  task reset_all: :environment do
    puts "Dropping all databases..."
    Rake::Task['db:drop'].invoke
    Rake::Task['db:mongoid:drop'].invoke
    
    puts "Creating SQLite databases..."
    Rake::Task['db:create'].invoke
    
    puts "Running migrations..."
    Rake::Task['db:migrate'].invoke
    
    puts "Creating MongoDB indexes..."
    Rake::Task['db:mongoid:create_indexes'].invoke
    
    if File.exist?('db/seeds.rb')
      puts "Seeding databases..."
      Rake::Task['db:seed'].invoke
    end
    
    puts "✓ All databases reset successfully"
  end
end
